using TaskManager.Api.Modules.Issues.Dtos;

namespace TaskManager.Api.Modules.Issues.Services;

public interface IIssueMentionService
{
    Task<List<IssueMentionDto>> GetMentionsAsync(Guid issueId, CancellationToken ct = default);
    Task SyncMentionsAsync(Guid issueId, List<Guid> mentionedUserIds, CancellationToken ct = default);
}
