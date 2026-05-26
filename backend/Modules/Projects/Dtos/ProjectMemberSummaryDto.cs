namespace TaskManager.Api.Modules.Projects.Dtos;

public class ProjectMemberSummaryDto
{
    public Guid UserId { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public string Initials { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
}
