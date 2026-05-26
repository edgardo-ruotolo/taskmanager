using TaskManager.Api.Modules.Cycles.Entities;

namespace TaskManager.Api.Modules.Cycles.Dtos;

public class CycleDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public CycleStatus Status { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public Guid ProjectId { get; set; }
    public Guid OwnerId { get; set; }
    public Guid? LeadId { get; set; }
    public string? LeadName { get; set; }
    public int IssueCount { get; set; }
    public int TotalIssues { get; set; }
    public int CompletedIssues { get; set; }
    public decimal? Velocity { get; set; }
    public List<CycleMemberSummaryDto> Members { get; set; } = [];
    public bool IsArchived { get; set; }
    public DateTime? ArchivedAt { get; set; }
    public DateTime? ClosedAt { get; set; }
    public DateTime CreatedAt { get; set; }
}
