using TaskManager.Api.Modules.Projects.Entities;

namespace TaskManager.Api.Modules.Projects.Dtos;

public class ProjectInvitationDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public ProjectRole Role { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime? AcceptedAt { get; set; }
}
