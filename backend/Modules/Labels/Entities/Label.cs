using TaskManager.Api.Common.Auditing;
using TaskManager.Api.Modules.Workspaces.Entities;

namespace TaskManager.Api.Modules.Labels.Entities;

public class Label : AuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid WorkspaceId { get; set; }
    public Workspace Workspace { get; set; } = null!;
}
