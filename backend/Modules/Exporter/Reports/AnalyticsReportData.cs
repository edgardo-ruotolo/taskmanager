using TaskManager.Api.Modules.Analytics.Dtos;
using TaskManager.Api.Modules.Analytics.Services;
using TaskManager.Api.Common.Pagination;

namespace TaskManager.Api.Modules.Exporter.Reports;

public class AnalyticsReportData
{
    public string WorkspaceName { get; set; } = string.Empty;
    public string ReportName { get; set; } = "Reporte de Analytics";
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
    public string GeneratedBy { get; set; } = string.Empty;
    public AnalyticsFilters Filters { get; set; } = new();
    public string FiltersSummary { get; set; } = "Sin filtros aplicados";
    public List<string> Sections { get; set; } = new();

    public OverviewMetrics? Overview { get; set; }
    public IReadOnlyList<StateBucket>? IssuesByState { get; set; }
    public IReadOnlyList<PriorityBucket>? IssuesByPriority { get; set; }
    public IReadOnlyList<IssueGanttDto>? Gantt { get; set; }
    public IReadOnlyList<BurndownPoint>? Burndown { get; set; }
    public PagedResult<IssueRowDto>? Drilldown { get; set; }
    public IReadOnlyList<UserRankingDto>? UserRanking { get; set; }
    public IReadOnlyList<ClientComparisonDto>? ClientComparison { get; set; }
}
