using TaskManager.Api.Modules.Auth.Entities;

namespace TaskManager.Api.Modules.Issues.Entities;

public class IssueVersion
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid IssueId { get; set; }
    public Issue Issue { get; set; } = null!;
    public Guid OwnedById { get; set; }
    public User OwnedBy { get; set; } = null!;
    public DateTime LastSavedAt { get; set; } = DateTime.UtcNow;
    public string? DescriptionJson { get; set; }
}
