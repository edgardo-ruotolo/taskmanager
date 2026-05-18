using TaskManager.Api.Common.Auditing;
using TaskManager.Api.Modules.Workspaces.Entities;

namespace TaskManager.Api.Modules.Issues.Entities;

public class IssueType : AuditableEntity
{
    public string Name { get; set; } = "";
    public string? Description { get; set; }
    public string Color { get; set; } = "#6b7280";
    public string? Icon { get; set; }
    public bool IsDefault { get; set; }
    public Guid WorkspaceId { get; set; }
    public Workspace Workspace { get; set; } = null!;
}
