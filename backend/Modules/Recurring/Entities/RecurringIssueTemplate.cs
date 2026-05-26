using TaskManager.Api.Common.Auditing;
using TaskManager.Api.Modules.Auth.Entities;
using TaskManager.Api.Modules.Cycles.Entities;
using TaskManager.Api.Modules.Issues.Entities;
using TaskManager.Api.Modules.Workspaces.Entities;

namespace TaskManager.Api.Modules.Recurring.Entities;

public class RecurringIssueTemplate : AuditableEntity
{
    public int SequenceId { get; set; } = 1;
    public Guid WorkspaceId { get; set; }
    public Workspace Workspace { get; set; } = null!;
    public string Name { get; set; } = string.Empty;
    public string DescriptionHtml { get; set; } = string.Empty;
    public RecurringFrequency Frequency { get; set; }
    public int Interval { get; set; } = 1;
    public int[] DaysOfWeek { get; set; } = [];
    public int? DayOfMonth { get; set; }
    public int? MonthOfYear { get; set; }
    public TimeOnly RunAtTime { get; set; } = new(6, 0);
    public TimeOnly? EndTime { get; set; }
    public string Timezone { get; set; } = "UTC";
    public DateOnly StartsOn { get; set; }
    public DateOnly? EndsOn { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsPaused { get; set; } = false;
    public bool SkipNextRun { get; set; } = false;
    public DateTime? LastRunAt { get; set; }
    public DateTime? NextRunAt { get; set; }
    public string StateGroup { get; set; } = "unstarted";
    public string Priority { get; set; } = "none";
    public int StartDateOffsetDays { get; set; } = 0;
    public int TargetDateOffsetDays { get; set; } = 7;
    public BlockPolicy BlockPolicy { get; set; } = BlockPolicy.SkipAndNotify;
    public Guid? IssueTypeId { get; set; }
    public IssueType? IssueType { get; set; }
    public Guid? CycleId { get; set; }
    public Cycle? Cycle { get; set; }
    public Guid CreatedById { get; set; }
    public User CreatedBy { get; set; } = null!;
    public ICollection<RecurringIssueTemplateProject> Projects { get; set; } = [];
    public ICollection<RecurringIssueTemplateAssignee> Assignees { get; set; } = [];
    public ICollection<RecurringIssueTemplateLabel> Labels { get; set; } = [];
    public ICollection<RecurringIssueRun> Runs { get; set; } = [];
}
