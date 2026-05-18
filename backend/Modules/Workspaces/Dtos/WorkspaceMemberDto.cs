using TaskManager.Api.Modules.Workspaces.Entities;

namespace TaskManager.Api.Modules.Workspaces.Dtos;

public class WorkspaceMemberDto
{
    public Guid UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string? DisplayName { get; set; }
    public string? AvatarUrl { get; set; }
    public WorkspaceRole Role { get; set; }
    public bool IsActive { get; set; }
}
