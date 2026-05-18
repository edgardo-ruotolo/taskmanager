using TaskManager.Api.Modules.Workspaces.Entities;

namespace TaskManager.Api.Modules.Workspaces.Dtos;

public class WorkspaceInvitationDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public WorkspaceRole Role { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime? AcceptedAt { get; set; }
}
