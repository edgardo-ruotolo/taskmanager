using TaskManager.Api.Common.Auditing;
using TaskManager.Api.Modules.Auth.Entities;
using TaskManager.Api.Modules.Projects.Entities;

namespace TaskManager.Api.Modules.Cycles.Entities;

public enum CycleStatus { Draft, Started, Completed }

public class Cycle : AuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public CycleStatus Status { get; set; } = CycleStatus.Draft;
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;
    public Guid OwnerId { get; set; }
    public User Owner { get; set; } = null!;
    public Guid? LeadId { get; set; }
    public User? Lead { get; set; }
    public bool IsArchived { get; set; } = false;
    public DateTime? ArchivedAt { get; set; }
    public DateTime? ClosedAt { get; set; }
    public ICollection<CycleIssue> CycleIssues { get; set; } = [];
}
