using TaskManager.Api.Modules.Auth.Entities;

namespace TaskManager.Api.Modules.Issues.Entities;

public class IssueVersion
{
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public Guid IssueId { get; set; }
    public Issue Issue { get; set; } = null!;
    public Guid OwnedById { get; set; }
    public User OwnedBy { get; set; } = null!;
    public DateTime LastSavedAt { get; set; } = DateTime.UtcNow;
    public string? DescriptionJson { get; set; }
    public string? AssigneeIdsJson { get; set; }
    public string? LabelIdsJson { get; set; }
    public string? ModuleIdsJson { get; set; }
    public Guid? CycleId { get; set; }
    public string? PropertiesJson { get; set; }
    public string? MetaJson { get; set; }
}
