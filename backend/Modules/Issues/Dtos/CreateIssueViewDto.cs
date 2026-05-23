namespace TaskManager.Api.Modules.Issues.Dtos;

public class CreateIssueViewDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? ProjectId { get; set; }
    public bool IsPublic { get; set; } = false;
    public string FiltersJson { get; set; } = "{}";
    public string DisplayPropertiesJson { get; set; } = "{}";
    public string Layout { get; set; } = "list";
}
