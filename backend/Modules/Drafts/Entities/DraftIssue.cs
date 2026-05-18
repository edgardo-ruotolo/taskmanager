using TaskManager.Api.Common.Auditing;
using TaskManager.Api.Modules.Auth.Entities;
using TaskManager.Api.Modules.Companies.Entities;
using TaskManager.Api.Modules.Issues.Entities;
using TaskManager.Api.Modules.States.Entities;

namespace TaskManager.Api.Modules.Drafts.Entities;

public class DraftIssue : AuditableEntity
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public IssuePriority Priority { get; set; } = IssuePriority.None;
    public Guid CompanyId { get; set; }
    public Company Company { get; set; } = null!;
    public Guid? StateId { get; set; }
    public State? State { get; set; }
    public Guid OwnedById { get; set; }
    public User OwnedBy { get; set; } = null!;
    public Guid? AssigneeId { get; set; }
    public User? Assignee { get; set; }
    public DateTime? DueDate { get; set; }
}
