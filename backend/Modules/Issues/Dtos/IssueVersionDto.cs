namespace TaskManager.Api.Modules.Issues.Dtos;

public class IssueVersionDto
{
    public Guid Id { get; set; }
    public Guid IssueId { get; set; }
    public Guid OwnedById { get; set; }
    public string OwnedByName { get; set; } = string.Empty;
    public DateTime LastSavedAt { get; set; }
    public string? DescriptionJson { get; set; }
}
