using ClosedXML.Excel;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using System.Text;
using System.Text.Json;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Analytics.Dtos;
using TaskManager.Api.Modules.Analytics.Services;
using TaskManager.Api.Modules.Exporter.Dtos;
using TaskManager.Api.Modules.Exporter.Entities;
using TaskManager.Api.Modules.Exporter.Reports;
using TaskManager.Api.Modules.Issues.Entities;
using TaskManager.Api.Modules.States.Entities;

namespace TaskManager.Api.Modules.Exporter.Jobs;

public class ExportJob(
    AppDbContext db,
    IWebHostEnvironment env,
    IAnalyticsService analytics,
    ILogger<ExportJob> logger)
{
    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    public async Task RunAsync(Guid exportId, CancellationToken ct = default)
    {
        var export = await db.ExporterHistories
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(e => e.Id == exportId, ct);
        if (export is null) return;

        try
        {
            export.Status = ExportStatus.Processing;
            await db.SaveChangesAsync(ct);

            var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Id == export.WorkspaceId, ct)
                ?? throw new InvalidOperationException("Workspace not found");

            var (filters, sections, reportName) = ParseRequest(export.Filters);

            var uploadsDir = Path.Combine(env.WebRootPath ?? env.ContentRootPath, "exports");
            Directory.CreateDirectory(uploadsDir);

            string fileName;
            string filePath;

            switch (export.Format)
            {
                case ExportFormat.Csv:
                    fileName = $"export_{export.Id:N}.csv";
                    filePath = Path.Combine(uploadsDir, fileName);
                    await WriteCsvAsync(filePath, workspace.Id, filters, ct);
                    break;

                case ExportFormat.Xlsx:
                    fileName = $"export_{export.Id:N}.xlsx";
                    filePath = Path.Combine(uploadsDir, fileName);
                    await WriteXlsxAsync(filePath, workspace.Id, filters, ct);
                    break;

                case ExportFormat.Pdf:
                    fileName = $"report_{export.Id:N}.pdf";
                    filePath = Path.Combine(uploadsDir, fileName);
                    await WritePdfAsync(filePath, workspace.Slug, workspace.Name, export, filters, sections, reportName, ct);
                    break;

                case ExportFormat.Json:
                default:
                    fileName = $"export_{export.Id:N}.json";
                    filePath = Path.Combine(uploadsDir, fileName);
                    await WriteJsonAsync(filePath, workspace.Id, filters, ct);
                    break;
            }

            export.Status = ExportStatus.Completed;
            export.FilePath = filePath;
            export.FileName = fileName;
            export.CompletedAt = DateTime.UtcNow;
            await db.SaveChangesAsync(ct);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Export {ExportId} failed", exportId);
            export.Status = ExportStatus.Failed;
            export.ErrorMessage = ex.Message;
            await db.SaveChangesAsync(ct);
        }
    }

    private static (AnalyticsFilters filters, List<string> sections, string? reportName) ParseRequest(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw))
        {
            return (new AnalyticsFilters(), new List<string>(), null);
        }

        try
        {
            var dto = JsonSerializer.Deserialize<ReportRequestDto>(raw, JsonOpts);
            if (dto is null) return (new AnalyticsFilters(), new List<string>(), null);

            return (
                dto.Filters ?? new AnalyticsFilters(),
                dto.Sections ?? new List<string>(),
                dto.ReportName);
        }
        catch (JsonException)
        {
            return (new AnalyticsFilters(), new List<string>(), null);
        }
    }

    private async Task<List<Issue>> LoadIssuesAsync(Guid workspaceId, AnalyticsFilters filters, CancellationToken ct)
    {
        return await db.Issues.AsNoTracking()
            .Include(i => i.State)
            .Include(i => i.Project)
            .Include(i => i.Assignee)
            .Include(i => i.Labels).ThenInclude(l => l.Label)
            .ApplyAnalyticsFilters(filters, workspaceId)
            .OrderBy(i => i.Project.Identifier)
            .ThenBy(i => i.SequenceId)
            .ToListAsync(ct);
    }

    private async Task WriteCsvAsync(string filePath, Guid workspaceId, AnalyticsFilters filters, CancellationToken ct)
    {
        var issues = await LoadIssuesAsync(workspaceId, filters, ct);
        var csv = new StringBuilder();
        csv.AppendLine("ID,Project,Title,Priority,State,Assignee,Labels,StartDate,DueDate,CompletedAt,CreatedAt");
        foreach (var i in issues)
        {
            var labels = string.Join("|", i.Labels.Select(l => l.Label.Name));
            var assignee = i.Assignee != null
                ? (i.Assignee.DisplayName ?? string.Concat(i.Assignee.FirstName ?? "", " ", i.Assignee.LastName ?? "").Trim())
                : string.Empty;

            csv.AppendLine(
                $"{i.Project.Identifier}-{i.SequenceId}," +
                $"{Escape(i.Project.Name)}," +
                $"{Escape(i.Title)}," +
                $"{i.Priority}," +
                $"{Escape(i.State?.Name ?? "")}," +
                $"{Escape(assignee)}," +
                $"{Escape(labels)}," +
                $"{i.StartDate:yyyy-MM-dd}," +
                $"{i.DueDate:yyyy-MM-dd}," +
                $"{i.CompletedAt:yyyy-MM-dd}," +
                $"{i.CreatedAt:yyyy-MM-dd}");
        }
        await File.WriteAllTextAsync(filePath, csv.ToString(), ct);
    }

    private async Task WriteXlsxAsync(string filePath, Guid workspaceId, AnalyticsFilters filters, CancellationToken ct)
    {
        var issues = await LoadIssuesAsync(workspaceId, filters, ct);

        using var wb = new XLWorkbook();
        var ws = wb.Worksheets.Add("Issues");

        string[] headers = { "ID", "Project", "Title", "Priority", "State", "Assignee", "Labels", "Start Date", "Due Date", "Completed At", "Created At" };
        for (var c = 0; c < headers.Length; c++)
        {
            ws.Cell(1, c + 1).Value = headers[c];
        }
        ws.Row(1).Style.Font.Bold = true;
        ws.Row(1).Style.Fill.BackgroundColor = XLColor.LightGray;

        for (var row = 0; row < issues.Count; row++)
        {
            var i = issues[row];
            var assignee = i.Assignee != null
                ? (i.Assignee.DisplayName ?? string.Concat(i.Assignee.FirstName ?? "", " ", i.Assignee.LastName ?? "").Trim())
                : string.Empty;
            var labels = string.Join(", ", i.Labels.Select(l => l.Label.Name));
            var r = row + 2;
            ws.Cell(r, 1).Value = $"{i.Project.Identifier}-{i.SequenceId}";
            ws.Cell(r, 2).Value = i.Project.Name;
            ws.Cell(r, 3).Value = i.Title;
            ws.Cell(r, 4).Value = i.Priority.ToString();
            ws.Cell(r, 5).Value = i.State?.Name ?? "";
            ws.Cell(r, 6).Value = assignee;
            ws.Cell(r, 7).Value = labels;
            if (i.StartDate.HasValue) ws.Cell(r, 8).Value = i.StartDate.Value.ToString("yyyy-MM-dd");
            if (i.DueDate.HasValue) ws.Cell(r, 9).Value = i.DueDate.Value.ToString("yyyy-MM-dd");
            if (i.CompletedAt.HasValue) ws.Cell(r, 10).Value = i.CompletedAt.Value.ToString("yyyy-MM-dd");
            ws.Cell(r, 11).Value = i.CreatedAt.ToString("yyyy-MM-dd");
        }
        ws.Columns().AdjustToContents();
        wb.SaveAs(filePath);
    }

    private async Task WriteJsonAsync(string filePath, Guid workspaceId, AnalyticsFilters filters, CancellationToken ct)
    {
        var issues = await LoadIssuesAsync(workspaceId, filters, ct);
        var data = issues.Select(i => new
        {
            id = $"{i.Project.Identifier}-{i.SequenceId}",
            project = i.Project.Name,
            title = i.Title,
            priority = i.Priority.ToString(),
            state = i.State?.Name,
            assignee = i.Assignee != null
                ? (i.Assignee.DisplayName ?? string.Concat(i.Assignee.FirstName ?? "", " ", i.Assignee.LastName ?? "").Trim())
                : null,
            labels = i.Labels.Select(l => l.Label.Name).ToList(),
            startDate = i.StartDate?.ToString("yyyy-MM-dd"),
            dueDate = i.DueDate?.ToString("yyyy-MM-dd"),
            completedAt = i.CompletedAt?.ToString("yyyy-MM-dd"),
            createdAt = i.CreatedAt.ToString("o"),
        });
        var content = JsonSerializer.Serialize(data, new JsonSerializerOptions { WriteIndented = true });
        await File.WriteAllTextAsync(filePath, content, ct);
    }

    private async Task WritePdfAsync(
        string filePath,
        string workspaceSlug,
        string workspaceName,
        ExporterHistory export,
        AnalyticsFilters filters,
        List<string> sections,
        string? reportName,
        CancellationToken ct)
    {
        var data = new AnalyticsReportData
        {
            WorkspaceName = workspaceName,
            ReportName = string.IsNullOrWhiteSpace(reportName) ? "Reporte de Analytics" : reportName,
            GeneratedAt = DateTime.UtcNow,
            Filters = filters,
            FiltersSummary = SummarizeFilters(filters),
            Sections = sections,
        };

        var requester = await db.Users.AsNoTracking()
            .Where(u => u.Id == export.RequestedById)
            .Select(u => new
            {
                u.FirstName,
                u.LastName,
                u.DisplayName,
                u.Email,
            })
            .FirstOrDefaultAsync(ct);

        if (requester is not null)
        {
            var name = requester.DisplayName
                ?? string.Concat(requester.FirstName ?? "", " ", requester.LastName ?? "").Trim();
            data.GeneratedBy = string.IsNullOrWhiteSpace(name) ? (requester.Email ?? "—") : name;
        }

        var includeAll = sections.Count == 0;

        if (includeAll || HasSection(sections, "kpis"))
        {
            data.Overview = await analytics.GetOverviewAsync(workspaceSlug, ct);
            data.IssuesByState = await analytics.GetIssuesByStateAsync(workspaceSlug, ct);
            data.IssuesByPriority = await analytics.GetIssuesByPriorityAsync(workspaceSlug, ct);
        }

        if (includeAll || HasSection(sections, "gantt"))
        {
            data.Gantt = await analytics.GetGanttAsync(workspaceSlug, filters, ct);
        }

        if (includeAll || HasSection(sections, "burndown"))
        {
            data.Burndown = await analytics.GetBurndownAsync(workspaceSlug, filters, ct);
        }

        if (includeAll || HasSection(sections, "ranking"))
        {
            data.UserRanking = await analytics.GetUserRankingAsync(workspaceSlug, filters, ct);
        }

        if (includeAll || HasSection(sections, "clients"))
        {
            data.ClientComparison = await analytics.GetClientComparisonAsync(workspaceSlug, filters, ct);
        }

        if (includeAll || HasSection(sections, "drilldown"))
        {
            data.Drilldown = await analytics.GetDrilldownAsync(workspaceSlug, filters, 1, 200, null, true, ct);
        }

        var doc = new AnalyticsReportDocument(data);
        doc.GeneratePdf(filePath);
    }

    private static bool HasSection(List<string> sections, string key)
        => sections.Any(s => string.Equals(s, key, StringComparison.OrdinalIgnoreCase));

    private static string SummarizeFilters(AnalyticsFilters f)
    {
        var parts = new List<string>();
        if (f.UserIds is { Count: > 0 }) parts.Add($"{f.UserIds.Count} usuario(s)");
        if (f.LabelIds is { Count: > 0 }) parts.Add($"{f.LabelIds.Count} cliente(s)");
        if (f.ProjectIds is { Count: > 0 }) parts.Add($"{f.ProjectIds.Count} proyecto(s)");
        if (f.StateIds is { Count: > 0 }) parts.Add($"{f.StateIds.Count} estado(s)");
        if (f.StateCategories is { Count: > 0 }) parts.Add($"categorías: {string.Join(", ", f.StateCategories)}");
        if (f.Priorities is { Count: > 0 }) parts.Add($"prioridades: {string.Join(", ", f.Priorities)}");
        if (f.DateFrom.HasValue || f.DateTo.HasValue)
        {
            var from = f.DateFrom?.ToString("dd/MM/yyyy") ?? "—";
            var to = f.DateTo?.ToString("dd/MM/yyyy") ?? "—";
            var field = string.IsNullOrWhiteSpace(f.DateField) ? "createdAt" : f.DateField;
            parts.Add($"{field}: {from} → {to}");
        }
        if (f.CycleId.HasValue) parts.Add("ciclo específico");
        if (f.IncludeArchived) parts.Add("incluye archivadas");

        return parts.Count == 0 ? "Sin filtros aplicados" : "Filtros: " + string.Join(" · ", parts);
    }

    private static string Escape(string? s)
    {
        if (string.IsNullOrEmpty(s)) return string.Empty;
        if (s.Contains(',') || s.Contains('"') || s.Contains('\n'))
        {
            return "\"" + s.Replace("\"", "\"\"") + "\"";
        }
        return s;
    }
}
