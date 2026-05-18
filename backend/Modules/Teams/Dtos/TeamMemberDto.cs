namespace TaskManager.Api.Modules.Teams.Dtos;

public class TeamMemberDto
{
    public Guid Id { get; set; }
    public Guid TeamId { get; set; }
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public string Role { get; set; } = "member";
}
