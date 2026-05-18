namespace TaskManager.Api.Modules.Issues.Dtos;

public class IssueLinkDto
{
    public Guid Id { get; set; }
    public string Url { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public Guid IssueId { get; set; }
    public DateTime CreatedAt { get; set; }
}
