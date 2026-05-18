namespace TaskManager.Api.Modules.Recurring.Entities;

public enum RecurringFrequency { Daily, Weekly, Monthly, Yearly }

public enum RecurringRunStatus
{
    Success,
    SkippedPreviousNotDone,
    SkippedPaused,
    SkippedManual,
    Failed
}

public enum BlockPolicy { SkipAndNotify }
