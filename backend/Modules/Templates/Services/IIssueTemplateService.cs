using TaskManager.Api.Modules.Templates.Dtos;

namespace TaskManager.Api.Modules.Templates.Services;

public interface IIssueTemplateService
{
    Task<List<IssueTemplateDto>> GetAllAsync(string workspaceSlug, CancellationToken ct = default);
    Task<IssueTemplateDto> GetByIdAsync(string workspaceSlug, Guid templateId, CancellationToken ct = default);
    Task<IssueTemplateDto> CreateAsync(string workspaceSlug, CreateIssueTemplateDto dto, CancellationToken ct = default);
    Task<IssueTemplateDto> UpdateAsync(string workspaceSlug, Guid templateId, CreateIssueTemplateDto dto, CancellationToken ct = default);
    Task DeleteAsync(string workspaceSlug, Guid templateId, CancellationToken ct = default);
}
