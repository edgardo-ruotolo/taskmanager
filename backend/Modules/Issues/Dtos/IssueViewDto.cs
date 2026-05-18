namespace TaskManager.Api.Modules.Issues.Dtos;

public class IssueViewDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid WorkspaceId { get; set; }
    public Guid? CompanyId { get; set; }
    public Guid OwnerId { get; set; }
    public bool IsPublic { get; set; }
    public string FiltersJson { get; set; } = "{}";
    public string DisplayPropertiesJson { get; set; } = "{}";
    public string Layout { get; set; } = "list";
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
