namespace TaskManager.Api.Modules.Analytics.Dtos;

public class UpdateAnalyticViewDto
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? Query { get; set; }
    public bool? IsGlobal { get; set; }
}
