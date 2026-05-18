namespace TaskManager.Api.Modules.Home.Dtos;

public class UserRecentVisitDto
{
    public Guid Id { get; set; }
    public string EntityType { get; set; } = string.Empty;
    public string EntityId { get; set; } = string.Empty;
    public string EntityTitle { get; set; } = string.Empty;
    public string? EntityUrl { get; set; }
    public DateTime VisitedAt { get; set; }
}
