using TaskManager.Api.Modules.Issues.Entities;

namespace TaskManager.Api.Modules.Analytics.Dtos;

public class AnalyticsFilters
{
    public List<Guid>? UserIds { get; set; }
    public List<Guid>? LabelIds { get; set; }
    public List<Guid>? ProjectIds { get; set; }
    public List<Guid>? StateIds { get; set; }
    public List<string>? StateCategories { get; set; }
    public List<IssuePriority>? Priorities { get; set; }
    public DateTime? DateFrom { get; set; }
    public DateTime? DateTo { get; set; }
    public string? DateField { get; set; }
    public Guid? CycleId { get; set; }
    public bool IncludeArchived { get; set; } = false;
}
