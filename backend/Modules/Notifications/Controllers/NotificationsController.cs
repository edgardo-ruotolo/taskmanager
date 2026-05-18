using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskManager.Api.Modules.Notifications.Dtos;
using TaskManager.Api.Modules.Notifications.Services;

namespace TaskManager.Api.Modules.Notifications.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public class NotificationsController(INotificationService notificationService) : ControllerBase
{
    private Guid CurrentUserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<List<NotificationDto>>> GetMy([FromQuery] bool unreadOnly = false, CancellationToken ct = default)
    {
        var notifications = await notificationService.GetMyNotificationsAsync(CurrentUserId, unreadOnly, ct);
        return Ok(notifications);
    }

    [HttpPatch("{id:guid}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id, CancellationToken ct)
    {
        await notificationService.MarkAsReadAsync(id, CurrentUserId, ct);
        return NoContent();
    }

    [HttpPatch("read-all")]
    public async Task<IActionResult> MarkAllAsRead(CancellationToken ct)
    {
        await notificationService.MarkAllAsReadAsync(CurrentUserId, ct);
        return NoContent();
    }
}
