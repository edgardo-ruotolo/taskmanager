using TaskManager.Api.Modules.Recurring.Dtos;

namespace TaskManager.Api.Modules.Recurring.Services;

public interface IRecurringService
{
    Task<RecurringTemplateDto> CreateAsync(string workspaceSlug, Guid userId, CreateRecurringTemplateDto dto, CancellationToken ct = default);
    Task<List<RecurringTemplateDto>> ListAsync(string workspaceSlug, Guid userId, CancellationToken ct = default);
    Task<RecurringTemplateDto> GetByIdAsync(string workspaceSlug, Guid templateId, Guid userId, CancellationToken ct = default);
    Task<RecurringTemplateDto> UpdateAsync(string workspaceSlug, Guid templateId, Guid userId, UpdateRecurringTemplateDto dto, CancellationToken ct = default);
    Task DeleteAsync(string workspaceSlug, Guid templateId, Guid userId, CancellationToken ct = default);
    Task<RecurringTemplateDto> PauseAsync(string workspaceSlug, Guid templateId, Guid userId, CancellationToken ct = default);
    Task<RecurringTemplateDto> ResumeAsync(string workspaceSlug, Guid templateId, Guid userId, CancellationToken ct = default);
    Task<RecurringTemplateDto> SkipNextAsync(string workspaceSlug, Guid templateId, Guid userId, CancellationToken ct = default);
    Task<List<RecurringRunDto>> GetRunsAsync(string workspaceSlug, Guid templateId, Guid userId, CancellationToken ct = default);
    Task<RecurringPreviewDto> PreviewAsync(string workspaceSlug, Guid templateId, int count, CancellationToken ct = default);
    Task<RecurringFromIssuePrefillDto> FromIssueAsync(string workspaceSlug, Guid issueId, Guid userId, CancellationToken ct = default);
}
