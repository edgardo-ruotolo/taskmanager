using TaskManager.Api.Modules.Projects.Entities;

namespace TaskManager.Api.Modules.Projects.Dtos;

public class CreateProjectInvitationDto
{
    public string Email { get; set; } = string.Empty;
    public ProjectRole Role { get; set; } = ProjectRole.Member;
}
