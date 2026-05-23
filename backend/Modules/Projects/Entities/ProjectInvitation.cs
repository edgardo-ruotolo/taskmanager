using TaskManager.Api.Common.Auditing;

namespace TaskManager.Api.Modules.Projects.Entities;

public class ProjectInvitation : AuditableEntity
{
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;
    public string Email { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
    public ProjectRole Role { get; set; } = ProjectRole.Member;
    public Guid InvitedById { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime? AcceptedAt { get; set; }
}
