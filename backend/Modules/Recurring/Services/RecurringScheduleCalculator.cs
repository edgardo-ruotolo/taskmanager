using TaskManager.Api.Modules.Recurring.Entities;

namespace TaskManager.Api.Modules.Recurring.Services;

public static class RecurringScheduleCalculator
{
    public static DateTime? ComputeNextRun(RecurringIssueTemplate template, DateTime? after = null)
    {
        TimeZoneInfo tz;
        try { tz = TimeZoneInfo.FindSystemTimeZoneById(template.Timezone); }
        catch { tz = TimeZoneInfo.Utc; }

        var nowUtc = after ?? DateTime.UtcNow;
        var nowLocal = TimeZoneInfo.ConvertTimeFromUtc(nowUtc, tz);

        var dtStart = template.StartsOn.ToDateTime(template.RunAtTime);
        var candidate = dtStart > nowLocal ? dtStart : nowLocal;

        DateTime? nextLocal = template.Frequency switch
        {
            RecurringFrequency.Daily => ComputeDaily(template, dtStart, candidate),
            RecurringFrequency.Weekly => ComputeWeekly(template, dtStart, candidate),
            RecurringFrequency.Monthly => ComputeMonthly(template, dtStart, candidate, monthsPerCycle: 1),
            RecurringFrequency.Quarterly => ComputeMonthly(template, dtStart, candidate, monthsPerCycle: 3),
            RecurringFrequency.Yearly => ComputeYearly(template, dtStart, candidate),
            _ => null
        };

        if (nextLocal is null) return null;

        if (template.EndsOn.HasValue && DateOnly.FromDateTime(nextLocal.Value) > template.EndsOn.Value)
            return null;

        return TimeZoneInfo.ConvertTimeToUtc(nextLocal.Value, tz);
    }

    private static DateTime? ComputeDaily(RecurringIssueTemplate t, DateTime dtStart, DateTime candidate)
    {
        var current = new DateTime(dtStart.Year, dtStart.Month, dtStart.Day,
            t.RunAtTime.Hour, t.RunAtTime.Minute, t.RunAtTime.Second);

        while (current <= candidate)
            current = current.AddDays(t.Interval);

        return current;
    }

    /// <summary>
    /// Calcula la próxima ejecución para cadencia semanal.
    /// Convención de días: 0=Lun, 1=Mar, 2=Mié, 3=Jue, 4=Vie, 5=Sáb, 6=Dom.
    /// El mapeo a <see cref="DayOfWeek"/> (Sun=0..Sat=6) se realiza internamente.
    /// </summary>
    private static DateTime? ComputeWeekly(RecurringIssueTemplate t, DateTime dtStart, DateTime candidate)
    {
        if (t.DaysOfWeek.Length == 0) return null;

        // Map 0=Mon..6=Sun to DayOfWeek (Sun=0, Mon=1... in .NET)
        var validDotNetDays = t.DaysOfWeek
            .Select(d => (DayOfWeek)(((d + 1) % 7)))
            .ToHashSet();

        var startOfWeek = dtStart.Date.AddDays(-(((int)dtStart.DayOfWeek + 6) % 7));
        var current = startOfWeek;

        while (true)
        {
            foreach (var dayOffset in Enumerable.Range(0, 7))
            {
                var day = current.AddDays(dayOffset);
                if (!validDotNetDays.Contains(day.DayOfWeek)) continue;
                var candidate2 = day.Add(t.RunAtTime.ToTimeSpan());
                if (candidate2 > candidate) return candidate2;
            }
            current = current.AddDays(7 * t.Interval);

            // safety guard — 4 years
            if (current > candidate.AddYears(4)) break;
        }
        return null;
    }

    /// <summary>
    /// Cálculo mensual con multiplicador de meses por ciclo.
    /// Monthly usa <c>monthsPerCycle=1</c>; Quarterly usa <c>monthsPerCycle=3</c>.
    /// El intervalo configurado se multiplica por <paramref name="monthsPerCycle"/>.
    /// </summary>
    private static DateTime? ComputeMonthly(RecurringIssueTemplate t, DateTime dtStart, DateTime candidate, int monthsPerCycle)
    {
        var targetDay = t.DayOfMonth ?? dtStart.Day;
        var current = new DateTime(dtStart.Year, dtStart.Month, 1);
        var step = Math.Max(1, t.Interval) * monthsPerCycle;

        while (true)
        {
            var lastDay = DateTime.DaysInMonth(current.Year, current.Month);
            var day = Math.Min(targetDay, lastDay);
            var date = new DateTime(current.Year, current.Month, day, t.RunAtTime.Hour, t.RunAtTime.Minute, t.RunAtTime.Second);

            if (date > candidate) return date;

            current = current.AddMonths(step);

            if (current > candidate.AddYears(4)) break;
        }
        return null;
    }

    private static DateTime? ComputeYearly(RecurringIssueTemplate t, DateTime dtStart, DateTime candidate)
    {
        var targetMonth = t.MonthOfYear ?? dtStart.Month;
        var targetDay = t.DayOfMonth ?? dtStart.Day;
        var currentYear = dtStart.Year;

        while (true)
        {
            var lastDay = DateTime.DaysInMonth(currentYear, targetMonth);
            var day = Math.Min(targetDay, lastDay);
            var date = new DateTime(currentYear, targetMonth, day, t.RunAtTime.Hour, t.RunAtTime.Minute, t.RunAtTime.Second);

            if (date > candidate) return date;

            currentYear += t.Interval;

            if (currentYear > candidate.Year + 4) break;
        }
        return null;
    }
}
