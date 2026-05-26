using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Api.Common.Auth;
using TaskManager.Api.Modules.Notifications.Dtos;
using TaskManager.Api.Modules.Notifications.Services;

namespace TaskManager.Api.Modules.Notifications.Controllers;

[ApiController]
[Route("api/notifications/preferences")]
[Authorize]
public class NotificationPreferencesController(
    IUserNotificationPreferenceService preferenceService,
    IUserNotificationSettingsService settingsService,
    ICurrentUser currentUser) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<UserNotificationPreferenceDto>>> GetAll(CancellationToken ct)
    {
        var result = await preferenceService.GetPreferencesAsync(currentUser.UserId, ct);
        return Ok(result);
    }

    [HttpPut]
    public async Task<ActionResult<List<UserNotificationPreferenceDto>>> Upsert(
        [FromBody] List<UpsertNotificationPreferenceDto> dtos, CancellationToken ct)
    {
        var result = await preferenceService.UpsertPreferencesAsync(currentUser.UserId, dtos, ct);
        return Ok(result);
    }

    [HttpGet("settings")]
    public async Task<ActionResult<UserNotificationSettingsDto>> GetSettings(CancellationToken ct)
    {
        var result = await settingsService.GetAsync(currentUser.UserId, ct);
        return Ok(result);
    }

    [HttpPut("settings")]
    public async Task<ActionResult<UserNotificationSettingsDto>> UpdateSettings(
        [FromBody] UpdateUserNotificationSettingsDto dto, CancellationToken ct)
    {
        var result = await settingsService.UpdateAsync(currentUser.UserId, dto, ct);
        return Ok(result);
    }
}
