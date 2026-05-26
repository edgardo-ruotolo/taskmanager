using TaskManager.Api.Modules.Issues.Entities;

namespace TaskManager.Api.Modules.Issues.Dtos;

public class CreateIssueDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? DescriptionHtml { get; set; }
    public string? DescriptionJson { get; set; }
    public IssuePriority Priority { get; set; } = IssuePriority.None;
    public Guid StateId { get; set; }
    public Guid? AssigneeId { get; set; }
    public List<Guid> AssigneeIds { get; set; } = [];
    public List<Guid> LabelIds { get; set; } = [];
    public List<Guid> ModuleIds { get; set; } = [];
    public Guid? CycleId { get; set; }
    public Guid? ParentId { get; set; }
    public Guid? IssueTypeId { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? DueDate { get; set; }
    public double SortOrder { get; set; } = 65535;
    public bool IsDraft { get; set; } = false;
    public bool RequiresAdminApproval { get; set; } = false;
    public List<Guid> ApprovalRequiredStateIds { get; set; } = [];
}
