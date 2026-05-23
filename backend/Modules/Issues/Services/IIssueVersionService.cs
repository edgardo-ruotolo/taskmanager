using TaskManager.Api.Modules.Issues.Dtos;

namespace TaskManager.Api.Modules.Issues.Services;

public interface IIssueVersionService
{
    Task<List<IssueVersionDto>> GetVersionsAsync(string workspaceSlug, Guid projectId, Guid issueId, CancellationToken ct = default);
    Task<IssueVersionDto> SaveVersionAsync(string workspaceSlug, Guid projectId, Guid issueId, Guid userId, CreateIssueVersionDto dto, CancellationToken ct = default);
}
