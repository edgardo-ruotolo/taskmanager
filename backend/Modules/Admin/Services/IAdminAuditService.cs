using TaskManager.Api.Common.Pagination;
using TaskManager.Api.Modules.Admin.Dtos;

namespace TaskManager.Api.Modules.Admin.Services;

public interface IAdminAuditService
{
    Task RecordAsync(
        Guid actorId,
        string? actorEmail,
        string action,
        string? targetType,
        string? targetId,
        string? payload,
        string? ipAddress,
        string? userAgent,
        CancellationToken ct = default);

    Task<PagedResult<AdminAuditLogDto>> GetAllAsync(int page, int pageSize, CancellationToken ct = default);
}
