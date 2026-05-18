using TaskManager.Api.Modules.Auth.Entities;

namespace TaskManager.Api.Modules.Issues.Entities;

public class IssueAssignee
{
    public Guid IssueId { get; set; }
    public Issue Issue { get; set; } = null!;
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
}
