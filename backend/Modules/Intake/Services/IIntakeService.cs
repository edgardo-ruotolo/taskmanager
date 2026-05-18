using TaskManager.Api.Common.Pagination;
using TaskManager.Api.Modules.Intake.Dtos;

namespace TaskManager.Api.Modules.Intake.Services;

public interface IIntakeService
{
    Task<PagedResult<IntakeIssueDto>> GetAllAsync(Guid companyId, string? status, int page, int pageSize, CancellationToken ct = default);
    Task<IntakeIssueDto> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IntakeIssueDto> CreateAsync(Guid companyId, CreateIntakeIssueDto dto, CancellationToken ct = default);
    Task<IntakeIssueDto> ReviewAsync(Guid id, Guid reviewerId, ReviewIntakeIssueDto dto, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
