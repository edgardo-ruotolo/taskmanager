using TaskManager.Api.Common.Auditing;
using TaskManager.Api.Modules.Auth.Entities;

namespace TaskManager.Api.Modules.Workspaces.Entities;

public enum WorkspaceRole { Guest = 5, Member = 15, Admin = 20 }

public class WorkspaceMember : AuditableEntity
{
    public Guid WorkspaceId { get; set; }
    public Workspace Workspace { get; set; } = null!;
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public WorkspaceRole Role { get; set; } = WorkspaceRole.Member;
    public bool IsActive { get; set; } = true;
}
