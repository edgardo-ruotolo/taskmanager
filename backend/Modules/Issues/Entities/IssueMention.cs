using TaskManager.Api.Modules.Auth.Entities;

namespace TaskManager.Api.Modules.Issues.Entities;

public class IssueMention
{
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public Guid IssueId { get; set; }
    public Issue Issue { get; set; } = null!;
    public Guid MentionedUserId { get; set; }
    public User MentionedUser { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
