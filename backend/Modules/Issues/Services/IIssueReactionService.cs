using TaskManager.Api.Modules.Issues.Dtos;

namespace TaskManager.Api.Modules.Issues.Services;

public interface IIssueReactionService
{
    Task<List<IssueReactionDto>> GetReactionsAsync(Guid issueId, CancellationToken ct = default);
    Task<IssueReactionDto> AddReactionAsync(Guid issueId, Guid actorId, CreateReactionDto dto, CancellationToken ct = default);
    Task RemoveReactionAsync(Guid issueId, Guid actorId, string emoji, CancellationToken ct = default);
}
