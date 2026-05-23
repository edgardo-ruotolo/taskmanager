using TaskManager.Api.Common.Auditing;
using TaskManager.Api.Modules.Auth.Entities;
using TaskManager.Api.Modules.Workspaces.Entities;

namespace TaskManager.Api.Modules.Exporter.Entities;

public enum ExportFormat { Csv, Xlsx, Json, Pdf }
public enum ExportStatus { Pending, Processing, Completed, Failed }

public class ExporterHistory : AuditableEntity
{
    public ExportFormat Format { get; set; }
    public ExportStatus Status { get; set; } = ExportStatus.Pending;
    public string? Filters { get; set; } // JSON string
    public string? FilePath { get; set; } // local path on server
    public string? FileName { get; set; }
    public string? ErrorMessage { get; set; }
    public Guid WorkspaceId { get; set; }
    public Workspace Workspace { get; set; } = null!;
    public Guid RequestedById { get; set; }
    public User RequestedBy { get; set; } = null!;
    public DateTime? CompletedAt { get; set; }
}
