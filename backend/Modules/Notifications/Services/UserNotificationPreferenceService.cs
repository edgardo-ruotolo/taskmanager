using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Notifications.Dtos;
using TaskManager.Api.Modules.Notifications.Entities;

namespace TaskManager.Api.Modules.Notifications.Services;

public class UserNotificationPreferenceService(AppDbContext db) : IUserNotificationPreferenceService
{
    public async Task<List<UserNotificationPreferenceDto>> GetPreferencesAsync(Guid userId, CancellationToken ct = default)
    {
        return await db.UserNotificationPreferences
            .Where(p => p.UserId == userId)
            .Select(p => new UserNotificationPreferenceDto
            {
                Id = p.Id,
                NotificationType = p.NotificationType,
                Property = p.Property,
                EmailNotification = p.EmailNotification
            })
            .ToListAsync(ct);
    }

    public async Task<List<UserNotificationPreferenceDto>> UpsertPreferencesAsync(Guid userId, List<UpsertNotificationPreferenceDto> dtos, CancellationToken ct = default)
    {
        foreach (var dto in dtos)
        {
            var existing = await db.UserNotificationPreferences
                .FirstOrDefaultAsync(p => p.UserId == userId && p.NotificationType == dto.NotificationType && p.Property == dto.Property, ct);

            if (existing is null)
            {
                db.UserNotificationPreferences.Add(new UserNotificationPreference
                {
                    UserId = userId,
                    NotificationType = dto.NotificationType,
                    Property = dto.Property,
                    EmailNotification = dto.EmailNotification
                });
            }
            else
            {
                existing.EmailNotification = dto.EmailNotification;
            }
        }

        await db.SaveChangesAsync(ct);
        return await GetPreferencesAsync(userId, ct);
    }
}
