namespace TaskManager.Api.Modules.Home.Dtos;

public class TrackVisitDto
{
    public string EntityType { get; set; } = string.Empty;
    public string EntityId { get; set; } = string.Empty;
    public string EntityTitle { get; set; } = string.Empty;
    public string? EntityUrl { get; set; }
}
