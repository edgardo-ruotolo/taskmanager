using TaskManager.Api.Modules.Recurring.Entities;

namespace TaskManager.Api.Modules.Recurring.Dtos;

public class RecurringTemplateDto
{
    public Guid Id { get; set; }
    public int SequenceId { get; set; }
    public Guid WorkspaceId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string DescriptionHtml { get; set; } = string.Empty;
    public string Frequency { get; set; } = string.Empty;
    public int Interval { get; set; }
    public int[] DaysOfWeek { get; set; } = [];
    public int? DayOfMonth { get; set; }
    public int? MonthOfYear { get; set; }
    public string RunAtTime { get; set; } = string.Empty;
    public string? EndTime { get; set; }
    public string Timezone { get; set; } = string.Empty;
    public string StartsOn { get; set; } = string.Empty;
    public string? EndsOn { get; set; }
    public bool IsActive { get; set; }
    public bool IsPaused { get; set; }
    public bool SkipNextRun { get; set; }
    public DateTime? LastRunAt { get; set; }
    public DateTime? NextRunAt { get; set; }
    public string StateGroup { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public int StartDateOffsetDays { get; set; }
    public int TargetDateOffsetDays { get; set; }
    public string BlockPolicy { get; set; } = string.Empty;
    public Guid CreatedById { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<Guid> CompanyIds { get; set; } = [];
    public List<Guid> AssigneeIds { get; set; } = [];
    public List<Guid> LabelIds { get; set; } = [];
}

public class CreateRecurringTemplateDto
{
    public string Name { get; set; } = string.Empty;
    public string DescriptionHtml { get; set; } = string.Empty;
    public RecurringFrequency Frequency { get; set; }
    public int Interval { get; set; } = 1;
    public int[] DaysOfWeek { get; set; } = [];
    public int? DayOfMonth { get; set; }
    public int? MonthOfYear { get; set; }
    public string RunAtTime { get; set; } = "06:00:00";
    public string? EndTime { get; set; }
    public string Timezone { get; set; } = "UTC";
    public string StartsOn { get; set; } = string.Empty;
    public string? EndsOn { get; set; }
    public string StateGroup { get; set; } = "unstarted";
    public string Priority { get; set; } = "none";
    public int StartDateOffsetDays { get; set; } = 0;
    public int TargetDateOffsetDays { get; set; } = 7;
    public BlockPolicy BlockPolicy { get; set; } = BlockPolicy.SkipAndNotify;
    public List<Guid> CompanyIds { get; set; } = [];
    public List<Guid> AssigneeIds { get; set; } = [];
    public List<Guid> LabelIds { get; set; } = [];
}

public class UpdateRecurringTemplateDto
{
    public string? Name { get; set; }
    public string? DescriptionHtml { get; set; }
    public RecurringFrequency? Frequency { get; set; }
    public int? Interval { get; set; }
    public int[]? DaysOfWeek { get; set; }
    public int? DayOfMonth { get; set; }
    public int? MonthOfYear { get; set; }
    public string? RunAtTime { get; set; }
    public string? EndTime { get; set; }
    public string? Timezone { get; set; }
    public string? StartsOn { get; set; }
    public string? EndsOn { get; set; }
    public string? StateGroup { get; set; }
    public string? Priority { get; set; }
    public int? StartDateOffsetDays { get; set; }
    public int? TargetDateOffsetDays { get; set; }
    public BlockPolicy? BlockPolicy { get; set; }
    public List<Guid>? CompanyIds { get; set; }
    public List<Guid>? AssigneeIds { get; set; }
    public List<Guid>? LabelIds { get; set; }
}

public class RecurringRunIssueRefDto
{
    public Guid IssueId { get; set; }
    public Guid CompanyId { get; set; }
}

public class RecurringRunDto
{
    public Guid Id { get; set; }
    public Guid TemplateId { get; set; }
    public DateTime ScheduledFor { get; set; }
    public DateTime? ExecutedAt { get; set; }
    public string Status { get; set; } = string.Empty;
    public string ErrorMessage { get; set; } = string.Empty;
    public List<RecurringRunIssueRefDto> GeneratedIssueIds { get; set; } = [];
    public List<Guid> BlockedByIssueIds { get; set; } = [];
    public DateTime CreatedAt { get; set; }
}

public class RecurringPreviewDto
{
    public List<DateTime> NextRuns { get; set; } = [];
}

public class RecurringFromIssuePrefillDto
{
    public string Name { get; set; } = string.Empty;
    public string DescriptionHtml { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public string StateGroup { get; set; } = string.Empty;
    public List<Guid> CompanyIds { get; set; } = [];
    public List<Guid> AssigneeIds { get; set; } = [];
    public List<Guid> LabelIds { get; set; } = [];
}
