using ClosedXML.Excel;
using Microsoft.EntityFrameworkCore;
using System.Text;
using System.Text.Json;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Exporter.Entities;
using TaskManager.Api.Modules.States.Entities;

namespace TaskManager.Api.Modules.Exporter.Jobs;

public class ExportJob(AppDbContext db, IWebHostEnvironment env)
{
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

            var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Id == export.WorkspaceId, ct);
            if (workspace is null) throw new InvalidOperationException("Workspace not found");

            var issues = await db.Issues
                .Include(i => i.State)
                .Include(i => i.Labels)
                .Where(i => i.Project.WorkspaceId == export.WorkspaceId)
                .OrderBy(i => i.SequenceId)
                .ToListAsync(ct);

            var uploadsDir = Path.Combine(env.WebRootPath ?? env.ContentRootPath, "exports");
            Directory.CreateDirectory(uploadsDir);

            string fileName;
            string filePath;

            switch (export.Format)
            {
                case ExportFormat.Csv:
                    fileName = $"export_{export.Id:N}.csv";
                    filePath = Path.Combine(uploadsDir, fileName);
                    var csv = new StringBuilder();
                    csv.AppendLine("ID,Title,Priority,State,DueDate,CreatedAt");
                    foreach (var issue in issues)
                        csv.AppendLine($"{issue.SequenceId},\"{issue.Title.Replace("\"", "\"\"")}\"," +
                            $"{issue.Priority},{issue.State?.Name},{issue.DueDate:yyyy-MM-dd},{issue.CreatedAt:yyyy-MM-dd}");
                    await File.WriteAllTextAsync(filePath, csv.ToString(), ct);
                    break;

                case ExportFormat.Xlsx:
                    fileName = $"export_{export.Id:N}.xlsx";
                    filePath = Path.Combine(uploadsDir, fileName);
                    using (var wb = new XLWorkbook())
                    {
                        var ws = wb.Worksheets.Add("Issues");
                        ws.Cell(1, 1).Value = "ID";
                        ws.Cell(1, 2).Value = "Title";
                        ws.Cell(1, 3).Value = "Priority";
                        ws.Cell(1, 4).Value = "State";
                        ws.Cell(1, 5).Value = "Due Date";
                        ws.Cell(1, 6).Value = "Created At";
                        ws.Row(1).Style.Font.Bold = true;

                        for (var row = 0; row < issues.Count; row++)
                        {
                            var issue = issues[row];
                            ws.Cell(row + 2, 1).Value = issue.SequenceId;
                            ws.Cell(row + 2, 2).Value = issue.Title;
                            ws.Cell(row + 2, 3).Value = issue.Priority.ToString();
                            ws.Cell(row + 2, 4).Value = issue.State?.Name ?? "";
                            if (issue.DueDate.HasValue) ws.Cell(row + 2, 5).Value = issue.DueDate.Value.ToString("yyyy-MM-dd");
                            ws.Cell(row + 2, 6).Value = issue.CreatedAt.ToString("yyyy-MM-dd");
                        }
                        ws.Columns().AdjustToContents();
                        wb.SaveAs(filePath);
                    }
                    break;

                case ExportFormat.Json:
                default:
                    fileName = $"export_{export.Id:N}.json";
                    filePath = Path.Combine(uploadsDir, fileName);
                    var jsonData = issues.Select(i => new
                    {
                        id = i.SequenceId,
                        title = i.Title,
                        priority = i.Priority.ToString(),
                        state = i.State?.Name,
                        dueDate = i.DueDate?.ToString("yyyy-MM-dd"),
                        createdAt = i.CreatedAt.ToString("o")
                    });
                    var content = JsonSerializer.Serialize(jsonData, new JsonSerializerOptions { WriteIndented = true });
                    await File.WriteAllTextAsync(filePath, content, ct);
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
            export.Status = ExportStatus.Failed;
            export.ErrorMessage = ex.Message;
            await db.SaveChangesAsync(ct);
        }
    }
}
