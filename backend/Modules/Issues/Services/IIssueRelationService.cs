using TaskManager.Api.Modules.Issues.Dtos;

namespace TaskManager.Api.Modules.Issues.Services;

public interface IIssueRelationService
{
    Task<List<IssueRelationDto>> GetRelationsAsync(string workspaceSlug, Guid projectId, Guid issueId, CancellationToken ct = default);
    Task<IssueRelationDto> CreateRelationAsync(string workspaceSlug, Guid projectId, Guid issueId, CreateIssueRelationDto dto, CancellationToken ct = default);
    Task DeleteRelationAsync(string workspaceSlug, Guid projectId, Guid issueId, Guid relationId, CancellationToken ct = default);
}
