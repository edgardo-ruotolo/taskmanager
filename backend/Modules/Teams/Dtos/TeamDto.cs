namespace TaskManager.Api.Modules.Teams.Dtos;

public class TeamDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Identifier { get; set; }
    public string? LogoUrl { get; set; }
    public Guid WorkspaceId { get; set; }
    public Guid CreatedById { get; set; }
    public int MemberCount { get; set; }
    public DateTime CreatedAt { get; set; }
}
