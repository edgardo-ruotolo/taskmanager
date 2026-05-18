using TaskManager.Api.Common.Auditing;
using TaskManager.Api.Modules.Auth.Entities;
using TaskManager.Api.Modules.Workspaces.Entities;

namespace TaskManager.Api.Modules.Favorites.Entities;

public class Favorite : AuditableEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public string EntityType { get; set; } = string.Empty;
    public Guid EntityId { get; set; }
    public Guid WorkspaceId { get; set; }
    public Workspace Workspace { get; set; } = null!;
    public int Sequence { get; set; } = 0;
}
