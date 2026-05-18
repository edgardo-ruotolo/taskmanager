using TaskManager.Api.Modules.Notifications.Dtos;

namespace TaskManager.Api.Modules.Notifications.Services;

public interface INotificationService
{
    Task<List<NotificationDto>> GetMyNotificationsAsync(Guid userId, bool unreadOnly = false, CancellationToken ct = default);
    Task MarkAsReadAsync(Guid notificationId, Guid userId, CancellationToken ct = default);
    Task MarkAllAsReadAsync(Guid userId, CancellationToken ct = default);
    Task CreateNotificationAsync(Guid recipientId, string title, string message, string entityType, string? entityId, Guid? senderId = null, CancellationToken ct = default);
}
