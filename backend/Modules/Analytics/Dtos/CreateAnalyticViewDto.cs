namespace TaskManager.Api.Modules.Analytics.Dtos;

public class CreateAnalyticViewDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Query { get; set; } = "{}";
    public bool IsGlobal { get; set; } = false;
}
