using TaskManager.Api.Modules.Intake.Entities;

namespace TaskManager.Api.Modules.Intake.Dtos;

public class IntakeIssueDto
{
    public Guid Id { get; set; }
    public Guid CompanyId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Source { get; set; }
    public string? SubmitterEmail { get; set; }
    public string? DeclineReason { get; set; }
    public DateTime? SnoozedUntil { get; set; }
    public Guid? AcceptedAsIssueId { get; set; }
    public Guid? DuplicateOfIssueId { get; set; }
    public Guid? ReviewedByUserId { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateIntakeIssueDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Source { get; set; }
    public string? SubmitterEmail { get; set; }
}

public class ReviewIntakeIssueDto
{
    public IntakeStatus Status { get; set; }
    public string? DeclineReason { get; set; }
    public DateTime? SnoozedUntil { get; set; }
    public Guid? AcceptedAsIssueId { get; set; }
    public Guid? DuplicateOfIssueId { get; set; }
}
