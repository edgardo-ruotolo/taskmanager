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

    /// <summary>
    /// Convención de días de la semana usada por el motor de recurrencia:
    /// 0 = Lunes, 1 = Martes, 2 = Miércoles, 3 = Jueves, 4 = Viernes, 5 = Sábado, 6 = Domingo.
    /// El frontend DEBE alinear su selector con esta convención (Lun=0..Dom=6).
    /// NOTA: difiere del estándar .NET <see cref="System.DayOfWeek"/> (Sun=0..Sat=6); el
    /// <see cref="Services.RecurringScheduleCalculator"/> realiza el mapeo internamente.
    /// </summary>
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
    public Guid? IssueTypeId { get; set; }
    public Guid? CycleId { get; set; }
    public Guid CreatedById { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // IDs planos (compatibilidad con clientes que sólo necesitan referencias)
    public List<Guid> ProjectIds { get; set; } = [];
    public List<Guid> AssigneeIds { get; set; } = [];
    public List<Guid> LabelIds { get; set; } = [];

    // Resúmenes enriquecidos para renderizado directo en UI
    public List<RecurringTemplateProjectSummaryDto> Projects { get; set; } = [];
    public List<RecurringTemplateAssigneeSummaryDto> Assignees { get; set; } = [];
    public RecurringTemplateCycleSummaryDto? Cycle { get; set; }
}

public class RecurringTemplateProjectSummaryDto
{
    public Guid Id { get; set; }
    public string Identifier { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
}

public class RecurringTemplateAssigneeSummaryDto
{
    public Guid Id { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
}

public class RecurringTemplateCycleSummaryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public Guid ProjectId { get; set; }
}

public class CreateRecurringTemplateDto
{
    public string Name { get; set; } = string.Empty;
    public string DescriptionHtml { get; set; } = string.Empty;
    public RecurringFrequency Frequency { get; set; }
    public int Interval { get; set; } = 1;

    /// <summary>
    /// Días de la semana (convención: 0=Lun..6=Dom). Requerido cuando Frequency = Weekly.
    /// </summary>
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
    public Guid? IssueTypeId { get; set; }
    public Guid? CycleId { get; set; }
    public List<Guid> ProjectIds { get; set; } = [];
    public List<Guid> AssigneeIds { get; set; } = [];
    public List<Guid> LabelIds { get; set; } = [];
}

public class UpdateRecurringTemplateDto
{
    public string? Name { get; set; }
    public string? DescriptionHtml { get; set; }
    public RecurringFrequency? Frequency { get; set; }
    public int? Interval { get; set; }

    /// <summary>
    /// Días de la semana (convención: 0=Lun..6=Dom).
    /// </summary>
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
    public Guid? IssueTypeId { get; set; }
    public Guid? CycleId { get; set; }
    public List<Guid>? ProjectIds { get; set; }
    public List<Guid>? AssigneeIds { get; set; }
    public List<Guid>? LabelIds { get; set; }
}

public class RecurringRunIssueRefDto
{
    public Guid IssueId { get; set; }
    public Guid ProjectId { get; set; }
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
    public Guid? IssueTypeId { get; set; }
    public List<Guid> ProjectIds { get; set; } = [];
    public List<Guid> AssigneeIds { get; set; } = [];
    public List<Guid> LabelIds { get; set; } = [];
}
