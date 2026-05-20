using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Api.Common.Auth;
using TaskManager.Api.Common.Authorization;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Importer.Dtos;
using TaskManager.Api.Modules.Importer.Entities;
using TaskManager.Api.Modules.Issues.Entities;

namespace TaskManager.Api.Modules.Importer.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/companies/{companyId:guid}/importer")]
[Authorize]
[ServiceFilter(typeof(RequireCompanyMemberAttribute))]
public class ImporterController(AppDbContext db, IConfiguration configuration, ICurrentUser currentUser) : ControllerBase
{

    [HttpPost("upload-csv")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<ImporterHistoryDto>> UploadCsv(
        string workspaceSlug,
        Guid companyId,
        IFormFile file,
        CancellationToken ct)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { message = "No file provided." });

        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct);
        if (workspace is null) return NotFound(new { message = "Workspace not found." });

        var company = await db.Companies.FirstOrDefaultAsync(c => c.Id == companyId && c.WorkspaceId == workspace.Id, ct);
        if (company is null) return NotFound(new { message = "Company not found." });

        // Read all lines from the uploaded CSV
        List<string> lines;
        using (var reader = new StreamReader(file.OpenReadStream(), Encoding.UTF8))
        {
            var content = await reader.ReadToEndAsync(ct);
            lines = content
                .Split('\n', StringSplitOptions.RemoveEmptyEntries)
                .Select(l => l.TrimEnd('\r'))
                .Where(l => !string.IsNullOrWhiteSpace(l))
                .ToList();
        }

        if (lines.Count < 2)
            return BadRequest(new { message = "CSV must have a header row and at least one data row." });

        // Parse headers (first line)
        var headers = lines[0].Split(',').Select(h => h.Trim().ToLowerInvariant()).ToArray();

        int titleIdx = Array.IndexOf(headers, "title");
        if (titleIdx < 0)
            return BadRequest(new { message = "CSV must contain a 'title' column." });

        int descriptionIdx = Array.IndexOf(headers, "description");
        int priorityIdx = Array.IndexOf(headers, "priority");
        int stateIdx = Array.IndexOf(headers, "state");

        // Create ImporterHistory with "processing" status
        var history = new ImporterHistory
        {
            WorkspaceId = workspace.Id,
            CompanyId = company.Id,
            FileName = file.FileName,
            TotalRows = lines.Count - 1,
            Status = "processing"
        };

        db.ImporterHistories.Add(history);
        await db.SaveChangesAsync(ct);

        // Get default state for the company
        var defaultState = await db.States.FirstOrDefaultAsync(s => s.IsDefault, ct)
            ?? await db.States.FirstOrDefaultAsync(ct);

        if (defaultState is null)
        {
            history.Status = "failed";
            history.ErrorLog = JsonSerializer.Serialize(new[] { "No states found in the system. Please create states before importing." });
            await db.SaveChangesAsync(ct);
            return Ok(MapToDto(history));
        }

        var errors = new List<string>();
        int successCount = 0;
        int errorCount = 0;
        var userId = currentUser.UserId;

        var connString = configuration.GetConnectionString("Postgres")!;

        for (int rowIndex = 1; rowIndex < lines.Count; rowIndex++)
        {
            var row = lines[rowIndex];
            var cols = row.Split(',');

            try
            {
                string title = titleIdx < cols.Length ? cols[titleIdx].Trim() : string.Empty;
                if (string.IsNullOrWhiteSpace(title))
                {
                    errors.Add($"Row {rowIndex}: 'title' is empty — skipped.");
                    errorCount++;
                    continue;
                }

                string? description = descriptionIdx >= 0 && descriptionIdx < cols.Length
                    ? cols[descriptionIdx].Trim().NullIfEmpty()
                    : null;

                var priority = IssuePriority.None;
                if (priorityIdx >= 0 && priorityIdx < cols.Length)
                {
                    var priorityStr = cols[priorityIdx].Trim().ToLowerInvariant();
                    priority = priorityStr switch
                    {
                        "urgent" => IssuePriority.Urgent,
                        "high" => IssuePriority.High,
                        "medium" => IssuePriority.Medium,
                        "low" => IssuePriority.Low,
                        _ => IssuePriority.None
                    };
                }

                // Resolve state by name (optional column)
                var state = defaultState;
                if (stateIdx >= 0 && stateIdx < cols.Length)
                {
                    var stateName = cols[stateIdx].Trim();
                    if (!string.IsNullOrWhiteSpace(stateName))
                    {
                        var namedState = await db.States
                            .FirstOrDefaultAsync(s => s.Name.ToLower() == stateName.ToLower(), ct);
                        if (namedState is not null) state = namedState;
                    }
                }

                // Generate sequence ID with advisory lock
                int sequenceId;
                await using var conn = new NpgsqlConnection(connString);
                await conn.OpenAsync(ct);
                await using var tx = await conn.BeginTransactionAsync(ct);

                var lockKey = BitConverter.ToInt64(companyId.ToByteArray(), 0);
                await using (var lockCmd = new NpgsqlCommand($"SELECT pg_advisory_xact_lock({lockKey})", conn, tx))
                    await lockCmd.ExecuteNonQueryAsync(ct);

                await using (var seqCmd = new NpgsqlCommand(
                    "SELECT COALESCE(MAX(\"SequenceId\"), 0) + 1 FROM \"Issues\" WHERE \"CompanyId\" = @companyId",
                    conn, tx))
                {
                    seqCmd.Parameters.AddWithValue("companyId", companyId);
                    sequenceId = Convert.ToInt32(await seqCmd.ExecuteScalarAsync(ct));
                }

                await tx.CommitAsync(ct);
                await conn.CloseAsync();

                var issue = new Issue
                {
                    Title = title,
                    Description = description,
                    Priority = priority,
                    StateId = state.Id,
                    CompanyId = company.Id,
                    CreatedById = userId,
                    SequenceId = sequenceId
                };

                db.Issues.Add(issue);
                await db.SaveChangesAsync(ct);
                successCount++;
            }
            catch (Exception ex)
            {
                errors.Add($"Row {rowIndex}: {ex.Message}");
                errorCount++;
            }
        }

        history.SuccessRows = successCount;
        history.ErrorRows = errorCount;
        history.Status = errorCount > 0 && successCount == 0 ? "failed" : "completed";
        history.ErrorLog = errors.Count > 0 ? JsonSerializer.Serialize(errors) : null;

        await db.SaveChangesAsync(ct);

        return Ok(MapToDto(history));
    }

    [HttpGet]
    public async Task<ActionResult<List<ImporterHistoryDto>>> GetHistory(
        string workspaceSlug,
        Guid companyId,
        CancellationToken ct)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct);
        if (workspace is null) return NotFound(new { message = "Workspace not found." });

        var histories = await db.ImporterHistories
            .Where(h => h.CompanyId == companyId && h.WorkspaceId == workspace.Id)
            .OrderByDescending(h => h.CreatedAt)
            .ToListAsync(ct);

        return Ok(histories.Select(MapToDto));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ImporterHistoryDto>> GetById(
        string workspaceSlug,
        Guid companyId,
        Guid id,
        CancellationToken ct)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct);
        if (workspace is null) return NotFound(new { message = "Workspace not found." });

        var history = await db.ImporterHistories
            .FirstOrDefaultAsync(h => h.Id == id && h.CompanyId == companyId && h.WorkspaceId == workspace.Id, ct);

        if (history is null) return NotFound(new { message = "Import history not found." });

        return Ok(MapToDto(history));
    }

    private static ImporterHistoryDto MapToDto(ImporterHistory h) => new()
    {
        Id = h.Id,
        WorkspaceId = h.WorkspaceId,
        CompanyId = h.CompanyId,
        FileName = h.FileName,
        TotalRows = h.TotalRows,
        SuccessRows = h.SuccessRows,
        ErrorRows = h.ErrorRows,
        Status = h.Status,
        ErrorLog = h.ErrorLog,
        CreatedAt = h.CreatedAt,
        UpdatedAt = h.UpdatedAt
    };
}

internal static class StringExtensions
{
    internal static string? NullIfEmpty(this string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value;
}
