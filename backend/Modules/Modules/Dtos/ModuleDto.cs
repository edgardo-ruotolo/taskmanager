using TaskManager.Api.Modules.Modules.Entities;

namespace TaskManager.Api.Modules.Modules.Dtos;

public class ModuleDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public ModuleStatus Status { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public DateTime? DueDate { get; set; }
    public Guid ProjectId { get; set; }
    public Guid OwnerId { get; set; }
    public Guid? LeadId { get; set; }
    public string? LeadName { get; set; }
    public int IssueCount { get; set; }
    public int TotalIssues { get; set; }
    public int CompletedIssues { get; set; }
    public List<ModuleMemberSummaryDto> Members { get; set; } = [];
    public bool IsArchived { get; set; }
    public DateTime? ArchivedAt { get; set; }
    public DateTime CreatedAt { get; set; }
}
