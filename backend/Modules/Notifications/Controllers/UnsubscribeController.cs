using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Api.Modules.Notifications.Services;

namespace TaskManager.Api.Modules.Notifications.Controllers;

/// <summary>
/// Anonymous endpoint hit by the <c>List-Unsubscribe</c> header link from any
/// outbound email. The token alone is the secret — no auth required.
/// </summary>
[ApiController]
[AllowAnonymous]
[Route("api/unsubscribe")]
public class UnsubscribeController(IUserNotificationSettingsService settingsService, IConfiguration configuration) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Unsubscribe([FromQuery] string token, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(token)) return BadRequest("Missing token.");

        var ok = await settingsService.UnsubscribeByTokenAsync(token, ct);
        var frontendUrl = configuration["App:FrontendUrl"]?.TrimEnd('/') ?? "";
        var target = ok
            ? $"{frontendUrl}/unsubscribe-confirmed"
            : $"{frontendUrl}/unsubscribe-failed";

        return Redirect(target);
    }

    [HttpPost]
    public async Task<IActionResult> UnsubscribeOneClick([FromQuery] string token, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(token)) return BadRequest("Missing token.");
        var ok = await settingsService.UnsubscribeByTokenAsync(token, ct);
        return ok ? Ok() : NotFound();
    }
}
