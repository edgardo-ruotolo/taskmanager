namespace TaskManager.Api.Modules.Recurring.Entities;

/// <summary>
/// Frecuencia de recurrencia de una plantilla.
/// IMPORTANTE: los valores numéricos se persisten en la base de datos. NO reordenar
/// ni cambiar los valores existentes — los nuevos valores deben agregarse al final.
/// </summary>
public enum RecurringFrequency
{
    Daily = 0,
    Weekly = 1,
    Monthly = 2,
    Yearly = 3,
    Quarterly = 4
}

public enum RecurringRunStatus
{
    Success,
    SkippedPreviousNotDone,
    SkippedPaused,
    SkippedManual,
    Failed
}

public enum BlockPolicy { SkipAndNotify }
