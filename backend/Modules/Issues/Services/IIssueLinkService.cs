using TaskManager.Api.Modules.Issues.Dtos;

namespace TaskManager.Api.Modules.Issues.Services;

public interface IIssueLinkService
{
    Task<List<IssueLinkDto>> GetLinksAsync(string workspaceSlug, Guid companyId, Guid issueId, CancellationToken ct = default);
    Task<IssueLinkDto> CreateLinkAsync(string workspaceSlug, Guid companyId, Guid issueId, CreateIssueLinkDto dto, CancellationToken ct = default);
    Task DeleteLinkAsync(string workspaceSlug, Guid companyId, Guid issueId, Guid linkId, CancellationToken ct = default);
}
