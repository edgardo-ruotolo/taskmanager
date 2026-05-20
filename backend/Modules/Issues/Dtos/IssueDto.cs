using TaskManager.Api.Modules.Issues.Entities;

namespace TaskManager.Api.Modules.Issues.Dtos;

public class IssueDto
{
    public Guid Id { get; set; }
    public int SequenceId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? DescriptionHtml { get; set; }
    public string? DescriptionJson { get; set; }
    public IssuePriority Priority { get; set; }
    public Guid CompanyId { get; set; }
    public Guid StateId { get; set; }
    public string StateName { get; set; } = string.Empty;
    public string StateColor { get; set; } = string.Empty;
    public string? StateGroup { get; set; }
    public Guid CreatedById { get; set; }
    public Guid? UpdatedById { get; set; }
    public Guid? AssigneeId { get; set; }
    public List<Guid> AssigneeIds { get; set; } = [];
    public List<Guid> LabelIds { get; set; } = [];
    public List<Guid> ModuleIds { get; set; } = [];
    public Guid? CycleId { get; set; }
    public Guid? ParentId { get; set; }
    public Guid? IssueTypeId { get; set; }
    public Guid? EstimatePointId { get; set; }
    public int? Point { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime? CompletedAt { get; set; }
    public double SortOrder { get; set; }
    public bool IsDraft { get; set; }
    public bool IsArchived { get; set; }
    public DateTime? ArchivedAt { get; set; }
    public string? ExternalSource { get; set; }
    public string? ExternalId { get; set; }
    public bool RequiresAdminApproval { get; set; }
    public List<Guid> ApprovalRequiredStateIds { get; set; } = [];
    public Guid? ApprovedById { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
