namespace TaskManager.Api.Modules.Issues.Dtos;

public class IssueMentionDto
{
    public Guid IssueId { get; set; }
    public Guid MentionedUserId { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateIssueMentionDto
{
    public List<Guid> MentionedUserIds { get; set; } = [];
}
