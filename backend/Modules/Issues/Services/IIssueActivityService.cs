using TaskManager.Api.Modules.Issues.Dtos;

namespace TaskManager.Api.Modules.Issues.Services;

public interface IIssueActivityService
{
    Task<List<IssueActivityDto>> GetActivitiesAsync(Guid issueId, CancellationToken ct = default);
    Task LogActivityAsync(Guid issueId, Guid actorId, string field, string? oldValue, string? newValue, CancellationToken ct = default);
}
