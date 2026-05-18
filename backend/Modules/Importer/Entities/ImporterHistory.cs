using TaskManager.Api.Common.Auditing;
using TaskManager.Api.Modules.Companies.Entities;
using TaskManager.Api.Modules.Workspaces.Entities;

namespace TaskManager.Api.Modules.Importer.Entities;

public class ImporterHistory : AuditableEntity
{
    public Guid WorkspaceId { get; set; }
    public Workspace Workspace { get; set; } = null!;

    public Guid CompanyId { get; set; }
    public Company Company { get; set; } = null!;

    public string FileName { get; set; } = string.Empty;
    public int TotalRows { get; set; }
    public int SuccessRows { get; set; }
    public int ErrorRows { get; set; }

    /// <summary>"pending" | "processing" | "completed" | "failed"</summary>
    public string Status { get; set; } = "pending";

    /// <summary>JSON array of error strings, nullable.</summary>
    public string? ErrorLog { get; set; }
}
