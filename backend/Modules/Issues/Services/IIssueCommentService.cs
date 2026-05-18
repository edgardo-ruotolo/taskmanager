using TaskManager.Api.Modules.Issues.Dtos;

namespace TaskManager.Api.Modules.Issues.Services;

public interface IIssueCommentService
{
    Task<List<IssueCommentDto>> GetCommentsAsync(Guid issueId, CancellationToken ct = default);
    Task<IssueCommentDto> CreateCommentAsync(Guid issueId, Guid authorId, CreateCommentDto dto, CancellationToken ct = default);
    Task DeleteCommentAsync(Guid commentId, Guid requesterId, CancellationToken ct = default);
}
