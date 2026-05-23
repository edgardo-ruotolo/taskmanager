using TaskManager.Api.Modules.Issues.Dtos;

namespace TaskManager.Api.Modules.Issues.Services;

public interface IIssueViewService
{
    Task<IEnumerable<IssueViewDto>> GetAllAsync(string workspaceSlug, Guid? projectId, Guid userId, CancellationToken ct = default);
    Task<IssueViewDto> GetByIdAsync(Guid id, Guid userId, CancellationToken ct = default);
    Task<IssueViewDto> CreateAsync(string workspaceSlug, Guid userId, CreateIssueViewDto dto, CancellationToken ct = default);
    Task<IssueViewDto> UpdateAsync(Guid id, Guid userId, UpdateIssueViewDto dto, CancellationToken ct = default);
    Task DeleteAsync(Guid id, Guid userId, CancellationToken ct = default);
}
