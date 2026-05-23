using TaskManager.Api.Common.Auditing;
using TaskManager.Api.Modules.Auth.Entities;
using TaskManager.Api.Modules.Projects.Entities;

namespace TaskManager.Api.Modules.Modules.Entities;

public enum ModuleStatus { Backlog, InProgress, Paused, Completed, Archived }

public class Module : AuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public ModuleStatus Status { get; set; } = ModuleStatus.Backlog;
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;
    public Guid OwnerId { get; set; }
    public User Owner { get; set; } = null!;
    public bool IsArchived { get; set; } = false;
    public DateTime? ArchivedAt { get; set; }
    public ICollection<ModuleIssue> ModuleIssues { get; set; } = [];
    public ICollection<ModuleLink> Links { get; set; } = [];
    public ICollection<ModuleMember> Members { get; set; } = [];
}
