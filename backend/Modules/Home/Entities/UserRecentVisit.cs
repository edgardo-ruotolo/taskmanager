using TaskManager.Api.Common.Auditing;
using TaskManager.Api.Modules.Auth.Entities;
using TaskManager.Api.Modules.Workspaces.Entities;

namespace TaskManager.Api.Modules.Home.Entities;

public class UserRecentVisit : AuditableEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public Guid WorkspaceId { get; set; }
    public Workspace Workspace { get; set; } = null!;
    public string EntityType { get; set; } = string.Empty; // issue | cycle | module | page | project
    public string EntityId { get; set; } = string.Empty;
    public string EntityTitle { get; set; } = string.Empty;
    public string? EntityUrl { get; set; }
    public DateTime VisitedAt { get; set; } = DateTime.UtcNow;
}
