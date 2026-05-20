using TaskManager.Api.Modules.Auth.Entities;

namespace TaskManager.Api.Modules.Issues.Entities;

public class IssueDescriptionVersion
{
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public Guid IssueId { get; set; }
    public Issue Issue { get; set; } = null!;
    public Guid OwnedById { get; set; }
    public User OwnedBy { get; set; } = null!;
    public string? DescriptionHtml { get; set; }
    public string? DescriptionJson { get; set; }
    public DateTime LastSavedAt { get; set; } = DateTime.UtcNow;
}
