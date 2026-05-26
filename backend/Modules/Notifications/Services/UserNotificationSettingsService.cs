using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Notifications.Dtos;
using TaskManager.Api.Modules.Notifications.Entities;

namespace TaskManager.Api.Modules.Notifications.Services;

public class UserNotificationSettingsService(AppDbContext db) : IUserNotificationSettingsService
{
    public async Task<UserNotificationSettings> GetOrCreateAsync(Guid userId, CancellationToken ct = default)
    {
        var existing = await db.UserNotificationSettings.FirstOrDefaultAsync(s => s.UserId == userId, ct);
        if (existing is not null) return existing;

        var created = new UserNotificationSettings { UserId = userId };
        db.UserNotificationSettings.Add(created);
        await db.SaveChangesAsync(ct);
        return created;
    }

    public async Task<UserNotificationSettingsDto> GetAsync(Guid userId, CancellationToken ct = default)
    {
        var settings = await GetOrCreateAsync(userId, ct);
        return new UserNotificationSettingsDto
        {
            Id = settings.Id,
            EmailUnsubscribed = settings.EmailUnsubscribed,
            EmailDailyDigest = settings.EmailDailyDigest
        };
    }

    public async Task<UserNotificationSettingsDto> UpdateAsync(Guid userId, UpdateUserNotificationSettingsDto dto, CancellationToken ct = default)
    {
        var settings = await GetOrCreateAsync(userId, ct);
        if (dto.EmailUnsubscribed.HasValue) settings.EmailUnsubscribed = dto.EmailUnsubscribed.Value;
        if (dto.EmailDailyDigest.HasValue) settings.EmailDailyDigest = dto.EmailDailyDigest.Value;
        await db.SaveChangesAsync(ct);

        return new UserNotificationSettingsDto
        {
            Id = settings.Id,
            EmailUnsubscribed = settings.EmailUnsubscribed,
            EmailDailyDigest = settings.EmailDailyDigest
        };
    }

    public async Task<bool> UnsubscribeByTokenAsync(string token, CancellationToken ct = default)
    {
        var settings = await db.UserNotificationSettings.FirstOrDefaultAsync(s => s.UnsubscribeToken == token, ct);
        if (settings is null) return false;

        settings.EmailUnsubscribed = true;
        await db.SaveChangesAsync(ct);
        return true;
    }
}
