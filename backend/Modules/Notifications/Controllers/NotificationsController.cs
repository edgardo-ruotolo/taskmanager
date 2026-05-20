using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Api.Common.Auth;
using TaskManager.Api.Modules.Notifications.Dtos;
using TaskManager.Api.Modules.Notifications.Services;

namespace TaskManager.Api.Modules.Notifications.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public class NotificationsController(INotificationService notificationService, ICurrentUser currentUser) : ControllerBase
{

    [HttpGet]
    public async Task<ActionResult<List<NotificationDto>>> GetMy([FromQuery] bool unreadOnly = false, CancellationToken ct = default)
    {
        var notifications = await notificationService.GetMyNotificationsAsync(currentUser.UserId, unreadOnly, ct);
        return Ok(notifications);
    }

    [HttpPatch("{id:guid}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id, CancellationToken ct)
    {
        await notificationService.MarkAsReadAsync(id, currentUser.UserId, ct);
        return NoContent();
    }

    [HttpPatch("read-all")]
    public async Task<IActionResult> MarkAllAsRead(CancellationToken ct)
    {
        await notificationService.MarkAllAsReadAsync(currentUser.UserId, ct);
        return NoContent();
    }
}
