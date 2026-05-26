using TaskManager.Api.Modules.Issues.Entities;

namespace TaskManager.Api.Modules.Issues.Dtos;

public class UpdateIssueDto
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? DescriptionHtml { get; set; }
    public string? DescriptionJson { get; set; }
    public IssuePriority? Priority { get; set; }
    public Guid? StateId { get; set; }
    public Guid? AssigneeId { get; set; }
    public List<Guid>? AssigneeIds { get; set; }
    public List<Guid>? LabelIds { get; set; }
    public List<Guid>? ModuleIds { get; set; }
    public Guid? CycleId { get; set; }
    public Guid? ParentId { get; set; }
    public Guid? IssueTypeId { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? DueDate { get; set; }
    public double? SortOrder { get; set; }
    public bool? IsDraft { get; set; }
    public bool? RequiresAdminApproval { get; set; }
    public List<Guid>? ApprovalRequiredStateIds { get; set; }
}
