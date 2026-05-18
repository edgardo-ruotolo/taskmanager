using TaskManager.Api.Common.Auditing;
using TaskManager.Api.Modules.Auth.Entities;

namespace TaskManager.Api.Modules.Workspaces.Entities;

public class WorkspaceActivity : AuditableEntity
{
    public Guid WorkspaceId { get; set; }
    public Workspace Workspace { get; set; } = null!;
    public Guid ActorId { get; set; }
    public User Actor { get; set; } = null!;
    public string Action { get; set; } = string.Empty;
    public string? EntityType { get; set; }
    public Guid? EntityId { get; set; }
    public string? EntityTitle { get; set; }
    public string? OldValue { get; set; }
    public string? NewValue { get; set; }
}
