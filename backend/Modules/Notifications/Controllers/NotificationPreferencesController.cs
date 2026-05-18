using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskManager.Api.Modules.Notifications.Dtos;
using TaskManager.Api.Modules.Notifications.Services;

namespace TaskManager.Api.Modules.Notifications.Controllers;

[ApiController]
[Route("api/notifications/preferences")]
[Authorize]
public class NotificationPreferencesController(IUserNotificationPreferenceService preferenceService) : ControllerBase
{
    private Guid CurrentUserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<List<UserNotificationPreferenceDto>>> GetAll(CancellationToken ct)
    {
        var result = await preferenceService.GetPreferencesAsync(CurrentUserId, ct);
        return Ok(result);
    }

    [HttpPut]
    public async Task<ActionResult<List<UserNotificationPreferenceDto>>> Upsert(
        [FromBody] List<UpsertNotificationPreferenceDto> dtos, CancellationToken ct)
    {
        var result = await preferenceService.UpsertPreferencesAsync(CurrentUserId, dtos, ct);
        return Ok(result);
    }
}
