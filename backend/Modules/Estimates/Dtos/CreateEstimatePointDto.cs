namespace TaskManager.Api.Modules.Estimates.Dtos;

public class CreateEstimatePointDto
{
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int SortOrder { get; set; }
}
