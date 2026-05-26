using TaskManager.Api.Modules.Home.Dtos;

namespace TaskManager.Api.Modules.Home.Services;

public interface IHomeSummaryService
{
    Task<HomeSummaryDto> GetSummaryAsync(string workspaceSlug, Guid userId, CancellationToken ct = default);
}
