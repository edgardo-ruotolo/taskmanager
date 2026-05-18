using TaskManager.Api.Common.Auditing;
using TaskManager.Api.Modules.Auth.Entities;
using TaskManager.Api.Modules.Workspaces.Entities;

namespace TaskManager.Api.Modules.Analytics.Entities;

public class AnalyticView : AuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Query { get; set; } = "{}"; // JSON: filters stored as string
    public bool IsGlobal { get; set; } = false;
    public Guid WorkspaceId { get; set; }
    public Workspace Workspace { get; set; } = null!;
    public Guid OwnedById { get; set; }
    public User OwnedBy { get; set; } = null!;
}
