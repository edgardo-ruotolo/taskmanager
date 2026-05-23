using Hangfire;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Api.Common.Auth;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Exporter.Dtos;
using TaskManager.Api.Modules.Exporter.Entities;
using TaskManager.Api.Modules.Exporter.Jobs;

namespace TaskManager.Api.Modules.Exporter.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/exports")]
[Authorize]
public class ExporterController(AppDbContext db, IBackgroundJobClient backgroundJobs, ICurrentUser currentUser) : ControllerBase
{

    [HttpGet]
    public async Task<ActionResult<List<ExporterHistoryDto>>> GetHistory(string workspaceSlug, CancellationToken ct)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct);
        if (workspace is null) return NotFound();

        var userId = currentUser.UserId;
        var history = await db.ExporterHistories
            .Where(e => e.WorkspaceId == workspace.Id && e.RequestedById == userId)
            .OrderByDescending(e => e.CreatedAt)
            .ToListAsync(ct);

        return Ok(history.Select(MapToDto));
    }

    [HttpPost]
    public async Task<ActionResult<ExporterHistoryDto>> CreateExport(
        string workspaceSlug, [FromBody] CreateExportDto dto, CancellationToken ct)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct);
        if (workspace is null) return NotFound();

        var format = dto.Format.ToLower() switch
        {
            "xlsx" => ExportFormat.Xlsx,
            "json" => ExportFormat.Json,
            "pdf" => ExportFormat.Pdf,
            _ => ExportFormat.Csv
        };

        var export = new ExporterHistory
        {
            WorkspaceId = workspace.Id,
            RequestedById = currentUser.UserId,
            Format = format,
            Filters = dto.Filters,
            Status = ExportStatus.Pending
        };

        db.ExporterHistories.Add(export);
        await db.SaveChangesAsync(ct);

        backgroundJobs.Enqueue<ExportJob>(j => j.RunAsync(export.Id, CancellationToken.None));

        return AcceptedAtAction(nameof(GetHistory), new { workspaceSlug }, MapToDto(export));
    }

    [HttpGet("{exportId:guid}/download")]
    public async Task<IActionResult> Download(string workspaceSlug, Guid exportId, CancellationToken ct)
    {
        var userId = currentUser.UserId;
        var export = await db.ExporterHistories
            .FirstOrDefaultAsync(e => e.Id == exportId && e.RequestedById == userId, ct);

        if (export is null) return NotFound();
        if (export.Status != ExportStatus.Completed || export.FilePath is null) return BadRequest("Export not ready.");
        if (!System.IO.File.Exists(export.FilePath)) return NotFound("File not found on server.");

        var contentType = export.Format switch
        {
            ExportFormat.Xlsx => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            ExportFormat.Json => "application/json",
            ExportFormat.Pdf => "application/pdf",
            _ => "text/csv"
        };

        return PhysicalFile(export.FilePath, contentType, export.FileName);
    }

    private static ExporterHistoryDto MapToDto(ExporterHistory e) => new()
    {
        Id = e.Id,
        Format = e.Format.ToString(),
        Status = e.Status.ToString(),
        FileName = e.FileName,
        ErrorMessage = e.ErrorMessage,
        CreatedAt = e.CreatedAt,
        CompletedAt = e.CompletedAt
    };
}
