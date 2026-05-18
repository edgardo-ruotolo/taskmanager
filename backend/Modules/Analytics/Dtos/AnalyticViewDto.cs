namespace TaskManager.Api.Modules.Analytics.Dtos;

public class AnalyticViewDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Query { get; set; } = "{}";
    public bool IsGlobal { get; set; }
    public Guid WorkspaceId { get; set; }
    public Guid OwnedById { get; set; }
    public DateTime CreatedAt { get; set; }
}
