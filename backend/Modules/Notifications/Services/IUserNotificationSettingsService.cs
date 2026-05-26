using TaskManager.Api.Modules.Notifications.Dtos;
using TaskManager.Api.Modules.Notifications.Entities;

namespace TaskManager.Api.Modules.Notifications.Services;

public interface IUserNotificationSettingsService
{
    Task<UserNotificationSettings> GetOrCreateAsync(Guid userId, CancellationToken ct = default);
    Task<UserNotificationSettingsDto> GetAsync(Guid userId, CancellationToken ct = default);
    Task<UserNotificationSettingsDto> UpdateAsync(Guid userId, UpdateUserNotificationSettingsDto dto, CancellationToken ct = default);
    Task<bool> UnsubscribeByTokenAsync(string token, CancellationToken ct = default);
}
