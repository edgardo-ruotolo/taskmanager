namespace TaskManager.Api.Modules.Issues.Dtos;

public class UpdateIssueViewDto
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public bool? IsPublic { get; set; }
    public string? FiltersJson { get; set; }
    public string? DisplayPropertiesJson { get; set; }
    public string? Layout { get; set; }
}
