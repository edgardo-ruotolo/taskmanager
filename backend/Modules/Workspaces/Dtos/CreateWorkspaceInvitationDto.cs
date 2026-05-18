using TaskManager.Api.Modules.Workspaces.Entities;

namespace TaskManager.Api.Modules.Workspaces.Dtos;

public class CreateWorkspaceInvitationDto
{
    public string Email { get; set; } = string.Empty;
    public WorkspaceRole Role { get; set; } = WorkspaceRole.Member;
}
