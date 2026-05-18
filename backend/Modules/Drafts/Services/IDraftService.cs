using TaskManager.Api.Modules.Drafts.Dtos;

namespace TaskManager.Api.Modules.Drafts.Services;

public interface IDraftService
{
    Task<List<DraftIssueDto>> GetAllAsync(string workspaceSlug, Guid userId, CancellationToken ct = default);
    Task<DraftIssueDto> GetByIdAsync(string workspaceSlug, Guid draftId, Guid userId, CancellationToken ct = default);
    Task<DraftIssueDto> CreateAsync(string workspaceSlug, Guid userId, CreateDraftIssueDto dto, CancellationToken ct = default);
    Task<DraftIssueDto> UpdateAsync(string workspaceSlug, Guid draftId, Guid userId, UpdateDraftIssueDto dto, CancellationToken ct = default);
    Task DeleteAsync(string workspaceSlug, Guid draftId, Guid userId, CancellationToken ct = default);
    Task<object> PublishAsync(string workspaceSlug, Guid draftId, Guid userId, CancellationToken ct = default);
}
