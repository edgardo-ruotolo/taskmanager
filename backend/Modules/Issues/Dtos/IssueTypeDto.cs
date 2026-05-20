namespace TaskManager.Api.Modules.Issues.Dtos;

public class IssueTypeDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = "";
    public string? Description { get; set; }
    public string Color { get; set; } = "#6b7280";
    public string? Icon { get; set; }
    public bool IsDefault { get; set; }
    public bool IsEpic { get; set; }
    public int Level { get; set; }
    public string? LogoProps { get; set; }
    public Guid WorkspaceId { get; set; }
    public DateTime CreatedAt { get; set; }
}
