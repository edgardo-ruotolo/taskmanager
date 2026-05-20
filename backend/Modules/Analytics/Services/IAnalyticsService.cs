using TaskManager.Api.Modules.Analytics.Dtos;

namespace TaskManager.Api.Modules.Analytics.Services;

public record OverviewMetrics(int Total, int Completed, int InProgress, int Overdue);
public record StateBucket(string StateName, int Count);
public record PriorityBucket(string Priority, int Count);
public record CreatedVsResolvedPoint(DateTime Date, int Created, int Resolved);
public record CompanyOverview(IReadOnlyList<CompanyStateBucket> IssuesByState, IReadOnlyList<PriorityBucket> IssuesByPriority);
public record CompanyStateBucket(Guid StateId, string StateName, int Count);
public record CompanyActivityPoint(string Date, int Completed);

public interface IAnalyticsService
{
    Task<OverviewMetrics> GetOverviewAsync(string workspaceSlug, CancellationToken ct = default);
    Task<IReadOnlyList<StateBucket>> GetIssuesByStateAsync(string workspaceSlug, CancellationToken ct = default);
    Task<IReadOnlyList<PriorityBucket>> GetIssuesByPriorityAsync(string workspaceSlug, CancellationToken ct = default);
    Task<IReadOnlyList<CreatedVsResolvedPoint>> GetCreatedVsResolvedAsync(string workspaceSlug, CancellationToken ct = default);
    Task<CompanyOverview> GetCompanyOverviewAsync(string workspaceSlug, string companyIdentifier, CancellationToken ct = default);
    Task<IReadOnlyList<CompanyActivityPoint>> GetCompanyActivityAsync(string workspaceSlug, string companyIdentifier, CancellationToken ct = default);
    Task<IReadOnlyList<AnalyticViewDto>> GetViewsAsync(string workspaceSlug, Guid userId, CancellationToken ct = default);
    Task<AnalyticViewDto> CreateViewAsync(string workspaceSlug, Guid userId, CreateAnalyticViewDto dto, CancellationToken ct = default);
    Task<AnalyticViewDto?> UpdateViewAsync(Guid viewId, Guid userId, UpdateAnalyticViewDto dto, CancellationToken ct = default);
    Task<bool> DeleteViewAsync(Guid viewId, Guid userId, CancellationToken ct = default);
}
