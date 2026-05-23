using TaskManager.Api.Common.Pagination;
using TaskManager.Api.Modules.Analytics.Dtos;

namespace TaskManager.Api.Modules.Analytics.Services;

public record OverviewMetrics(int Total, int Completed, int InProgress, int Overdue);
public record StateBucket(string StateName, int Count);
public record PriorityBucket(string Priority, int Count);
public record CreatedVsResolvedPoint(DateTime Date, int Created, int Resolved);
public record ProjectOverview(IReadOnlyList<ProjectStateBucket> IssuesByState, IReadOnlyList<PriorityBucket> IssuesByPriority);
public record ProjectStateBucket(Guid StateId, string StateName, int Count);
public record ProjectActivityPoint(string Date, int Completed);

public interface IAnalyticsService
{
    Task<OverviewMetrics> GetOverviewAsync(string workspaceSlug, CancellationToken ct = default);
    Task<IReadOnlyList<StateBucket>> GetIssuesByStateAsync(string workspaceSlug, CancellationToken ct = default);
    Task<IReadOnlyList<PriorityBucket>> GetIssuesByPriorityAsync(string workspaceSlug, CancellationToken ct = default);
    Task<IReadOnlyList<CreatedVsResolvedPoint>> GetCreatedVsResolvedAsync(string workspaceSlug, CancellationToken ct = default);
    Task<ProjectOverview> GetProjectOverviewAsync(string workspaceSlug, string projectIdentifier, CancellationToken ct = default);
    Task<IReadOnlyList<ProjectActivityPoint>> GetProjectActivityAsync(string workspaceSlug, string projectIdentifier, CancellationToken ct = default);
    Task<IReadOnlyList<AnalyticViewDto>> GetViewsAsync(string workspaceSlug, Guid userId, CancellationToken ct = default);
    Task<AnalyticViewDto> CreateViewAsync(string workspaceSlug, Guid userId, CreateAnalyticViewDto dto, CancellationToken ct = default);
    Task<AnalyticViewDto?> UpdateViewAsync(Guid viewId, Guid userId, UpdateAnalyticViewDto dto, CancellationToken ct = default);
    Task<bool> DeleteViewAsync(Guid viewId, Guid userId, CancellationToken ct = default);

    // Admin analytics with filters
    Task<IReadOnlyList<IssueGanttDto>> GetGanttAsync(string workspaceSlug, AnalyticsFilters filters, CancellationToken ct = default);
    Task<IReadOnlyList<BurndownPoint>> GetBurndownAsync(string workspaceSlug, AnalyticsFilters filters, CancellationToken ct = default);
    Task<PagedResult<IssueRowDto>> GetDrilldownAsync(string workspaceSlug, AnalyticsFilters filters, int page, int pageSize, string? sortBy, bool sortDesc, CancellationToken ct = default);
    Task<IReadOnlyList<UserRankingDto>> GetUserRankingAsync(string workspaceSlug, AnalyticsFilters filters, CancellationToken ct = default);
    Task<IReadOnlyList<ClientComparisonDto>> GetClientComparisonAsync(string workspaceSlug, AnalyticsFilters filters, CancellationToken ct = default);
}
