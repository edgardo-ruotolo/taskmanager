namespace TaskManager.Api.Modules.Issues.Dtos;

public class IssueReactionDto
{
    public Guid Id { get; set; }
    public string Emoji { get; set; } = "";
    public Guid ActorId { get; set; }
    public Guid IssueId { get; set; }
    public DateTime CreatedAt { get; set; }
}
