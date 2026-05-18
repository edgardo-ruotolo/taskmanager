using TaskManager.Api.Modules.Notifications.Dtos;

namespace TaskManager.Api.Modules.Notifications.Services;

public interface IUserNotificationPreferenceService
{
    Task<List<UserNotificationPreferenceDto>> GetPreferencesAsync(Guid userId, CancellationToken ct = default);
    Task<List<UserNotificationPreferenceDto>> UpsertPreferencesAsync(Guid userId, List<UpsertNotificationPreferenceDto> dtos, CancellationToken ct = default);
}
