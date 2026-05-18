namespace TaskManager.Api.Modules.Issues.Dtos;

public class CreateIssueTypeDto
{
    public string Name { get; set; } = "";
    public string? Description { get; set; }
    public string? Color { get; set; }
    public string? Icon { get; set; }
    public bool IsDefault { get; set; }
}
