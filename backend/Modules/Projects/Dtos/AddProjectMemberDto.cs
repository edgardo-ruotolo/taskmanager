using TaskManager.Api.Modules.Projects.Entities;

namespace TaskManager.Api.Modules.Projects.Dtos;

public class AddProjectMemberDto
{
    public Guid UserId { get; set; }
    public ProjectRole Role { get; set; } = ProjectRole.Member;
}
