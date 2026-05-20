using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Common.Pagination;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Admin.Dtos;
using TaskManager.Api.Modules.Admin.Entities;

namespace TaskManager.Api.Modules.Admin.Services;

public class AdminAuditService(AppDbContext db) : IAdminAuditService
{
    public async Task RecordAsync(
        Guid actorId,
        string? actorEmail,
        string action,
        string? targetType,
        string? targetId,
        string? payload,
        string? ipAddress,
        string? userAgent,
        CancellationToken ct = default)
    {
        db.AdminAuditLogs.Add(new AdminAuditLog
        {
            ActorId = actorId,
            ActorEmail = actorEmail,
            Action = action,
            TargetType = targetType,
            TargetId = targetId,
            Payload = payload,
            IpAddress = ipAddress,
            UserAgent = userAgent,
            Timestamp = DateTime.UtcNow
        });
        await db.SaveChangesAsync(ct);
    }

    public async Task<PagedResult<AdminAuditLogDto>> GetAllAsync(int page, int pageSize, CancellationToken ct = default)
    {
        var query = db.AdminAuditLogs.AsNoTracking().OrderByDescending(x => x.Timestamp);
        var total = await query.CountAsync(ct);
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new AdminAuditLogDto
            {
                Id = x.Id,
                Action = x.Action,
                ActorId = x.ActorId,
                ActorEmail = x.ActorEmail,
                TargetType = x.TargetType,
                TargetId = x.TargetId,
                Payload = x.Payload,
                IpAddress = x.IpAddress,
                UserAgent = x.UserAgent,
                Timestamp = x.Timestamp
            })
            .ToListAsync(ct);

        return new PagedResult<AdminAuditLogDto>
        {
            Items = items,
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        };
    }
}
