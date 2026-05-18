using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Common.Exceptions;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Notifications.Dtos;
using TaskManager.Api.Modules.Notifications.Entities;

namespace TaskManager.Api.Modules.Notifications.Services;

public class NotificationService(AppDbContext db, IMapper mapper) : INotificationService
{
    public async Task<List<NotificationDto>> GetMyNotificationsAsync(Guid userId, bool unreadOnly = false, CancellationToken ct = default)
    {
        var query = db.Notifications.Where(n => n.RecipientId == userId);

        if (unreadOnly)
            query = query.Where(n => !n.IsRead);

        var notifications = await query
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync(ct);

        return mapper.Map<List<NotificationDto>>(notifications);
    }

    public async Task MarkAsReadAsync(Guid notificationId, Guid userId, CancellationToken ct = default)
    {
        var notification = await db.Notifications
            .FirstOrDefaultAsync(n => n.Id == notificationId && n.RecipientId == userId, ct)
            ?? throw new NotFoundException("Notification not found.");

        notification.IsRead = true;
        await db.SaveChangesAsync(ct);
    }

    public async Task MarkAllAsReadAsync(Guid userId, CancellationToken ct = default)
    {
        var notifications = await db.Notifications
            .Where(n => n.RecipientId == userId && !n.IsRead)
            .ToListAsync(ct);

        foreach (var notification in notifications)
            notification.IsRead = true;

        await db.SaveChangesAsync(ct);
    }

    public async Task CreateNotificationAsync(Guid recipientId, string title, string message, string entityType, string? entityId, Guid? senderId = null, CancellationToken ct = default)
    {
        var notification = new Notification
        {
            RecipientId = recipientId,
            Title = title,
            Message = message,
            EntityType = entityType,
            EntityId = entityId,
            SenderId = senderId,
            IsRead = false
        };

        db.Notifications.Add(notification);
        await db.SaveChangesAsync(ct);
    }
}
