using TaskManager.Api.Modules.Projects.Entities;

namespace TaskManager.Api.Modules.Projects.Dtos;

public class ProjectMemberDto
{
    public Guid UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string? DisplayName { get; set; }
    public string? AvatarUrl { get; set; }
    public ProjectRole Role { get; set; }
}
