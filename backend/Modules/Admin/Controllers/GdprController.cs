using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Api.Modules.Admin.Services;

namespace TaskManager.Api.Modules.Admin.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin/gdpr")]
public class GdprController(IGdprService gdpr) : ControllerBase
{
    /// <summary>
    /// Permanently erases the target user. The actor must be an Admin.
    /// </summary>
    [HttpPost("users/{id:guid}/erase")]
    public async Task<IActionResult> EraseUser(Guid id, CancellationToken ct = default)
    {
        var actorIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(actorIdClaim, out var actorId))
            return Unauthorized();

        await gdpr.EraseUserAsync(
            targetUserId: id,
            actorId: actorId,
            actorEmail: User.FindFirstValue(ClaimTypes.Email),
            ipAddress: HttpContext.Connection.RemoteIpAddress?.ToString(),
            userAgent: Request.Headers.UserAgent.ToString(),
            ct: ct);

        return NoContent();
    }
}
