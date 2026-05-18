using TaskManager.Api.Common.Auditing;

namespace TaskManager.Api.Modules.Workspaces.Entities;

public class WorkspaceInvitation : AuditableEntity
{
    public Guid WorkspaceId { get; set; }
    public Workspace Workspace { get; set; } = null!;
    public string Email { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
    public WorkspaceRole Role { get; set; } = WorkspaceRole.Member;
    public Guid InvitedById { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime? AcceptedAt { get; set; }
}
