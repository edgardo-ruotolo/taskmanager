namespace TaskManager.Api.Modules.Issues.Dtos;

public class IssueSubscriberDto
{
    public Guid UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
