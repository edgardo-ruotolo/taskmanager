using TaskManager.Api.Modules.Analytics.Dtos;

namespace TaskManager.Api.Modules.Exporter.Dtos;

/// <summary>
/// Structured payload serialized into <c>ExporterHistory.Filters</c> when the
/// export is generated from the Analytics report builder. Contains both the
/// analytics filter criteria and the list of sections requested in the report.
/// </summary>
public class ReportRequestDto
{
    public string? ReportName { get; set; }
    public AnalyticsFilters? Filters { get; set; }
    public List<string>? Sections { get; set; }
}
