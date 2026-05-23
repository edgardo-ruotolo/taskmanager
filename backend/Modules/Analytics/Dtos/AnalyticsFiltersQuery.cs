using TaskManager.Api.Modules.Issues.Entities;

namespace TaskManager.Api.Modules.Analytics.Dtos;

/// <summary>
/// Binds AnalyticsFilters from a query string. Array fields accept either
/// CSV (`?userIds=guid1,guid2`) or repeated keys (`?userIds=guid1&amp;userIds=guid2`).
/// </summary>
public class AnalyticsFiltersQuery
{
    public string? UserIds { get; set; }
    public string? LabelIds { get; set; }
    public string? ProjectIds { get; set; }
    public string? StateIds { get; set; }
    public string? StateCategories { get; set; }
    public string? Priorities { get; set; }
    public DateTime? DateFrom { get; set; }
    public DateTime? DateTo { get; set; }
    public string? DateField { get; set; }
    public Guid? CycleId { get; set; }
    public bool IncludeArchived { get; set; } = false;

    public AnalyticsFilters ToFilters()
    {
        return new AnalyticsFilters
        {
            UserIds = ParseGuidList(UserIds),
            LabelIds = ParseGuidList(LabelIds),
            ProjectIds = ParseGuidList(ProjectIds),
            StateIds = ParseGuidList(StateIds),
            StateCategories = ParseStringList(StateCategories),
            Priorities = ParsePriorityList(Priorities),
            DateFrom = DateFrom,
            DateTo = DateTo,
            DateField = DateField,
            CycleId = CycleId,
            IncludeArchived = IncludeArchived,
        };
    }

    private static List<Guid>? ParseGuidList(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return null;
        var parts = raw.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        var list = new List<Guid>(parts.Length);
        foreach (var p in parts)
        {
            if (Guid.TryParse(p, out var g)) list.Add(g);
        }
        return list.Count == 0 ? null : list;
    }

    private static List<string>? ParseStringList(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return null;
        var parts = raw.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        return parts.Length == 0 ? null : parts.ToList();
    }

    private static List<IssuePriority>? ParsePriorityList(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return null;
        var parts = raw.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        var list = new List<IssuePriority>(parts.Length);
        foreach (var p in parts)
        {
            if (Enum.TryParse<IssuePriority>(p, ignoreCase: true, out var pr)) list.Add(pr);
        }
        return list.Count == 0 ? null : list;
    }
}
