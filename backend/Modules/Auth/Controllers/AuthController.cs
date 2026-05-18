using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Api.Modules.Auth.Dtos;
using TaskManager.Api.Modules.Auth.Services;
// MagicLinkRequestDto and MagicLinkVerifyDto are in the same Dtos namespace

namespace TaskManager.Api.Modules.Auth.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IAuthService authService) : ControllerBase
{
    private Guid CurrentUserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpPost("register")]
    public async Task<ActionResult<UserDto>> Register([FromBody] RegisterDto dto, CancellationToken ct)
    {
        var user = await authService.RegisterAsync(dto, ct);
        return Ok(user);
    }

    [HttpPost("login")]
    public async Task<ActionResult<UserDto>> Login([FromBody] LoginDto dto, CancellationToken ct)
    {
        var user = await authService.LoginAsync(dto, HttpContext, ct);
        return Ok(user);
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout(CancellationToken ct)
    {
        await authService.LogoutAsync(HttpContext, ct);
        return NoContent();
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<UserDto>> Me(CancellationToken ct)
    {
        var user = await authService.GetCurrentUserAsync(HttpContext, ct);
        if (user is null) return Unauthorized();
        return Ok(user);
    }

    [HttpPost("forgot-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto, CancellationToken ct)
    {
        await authService.ForgotPasswordAsync(dto, ct);
        return Ok(new { message = "Si el email existe, recibirás un enlace de recuperación." });
    }

    [HttpPost("reset-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto, CancellationToken ct)
    {
        await authService.ResetPasswordAsync(dto, ct);
        return Ok(new { message = "Contraseña restablecida correctamente." });
    }

    [HttpPut("profile")]
    [Authorize]
    public async Task<ActionResult<UserDto>> UpdateProfile([FromBody] UpdateProfileDto dto, CancellationToken ct)
    {
        var user = await authService.UpdateProfileAsync(CurrentUserId, dto, ct);
        return Ok(user);
    }

    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto, CancellationToken ct)
    {
        await authService.ChangePasswordAsync(CurrentUserId, dto, ct);
        return Ok(new { message = "Contraseña actualizada correctamente." });
    }

    [HttpDelete("me")]
    [Authorize]
    public async Task<IActionResult> DeactivateAccount(CancellationToken ct)
    {
        await authService.DeactivateAccountAsync(CurrentUserId, HttpContext, ct);
        return NoContent();
    }

    // ── Magic Link ──────────────────────────────────────────────────────────

    [HttpPost("magic-link")]
    [AllowAnonymous]
    public async Task<IActionResult> RequestMagicLink([FromBody] MagicLinkRequestDto dto, CancellationToken ct)
    {
        await authService.SendMagicLinkAsync(dto, ct);
        return Ok(new { message = "Si el email existe, recibirás un enlace." });
    }

    [HttpPost("magic-link/verify")]
    [AllowAnonymous]
    public async Task<ActionResult<UserDto>> VerifyMagicLink([FromBody] MagicLinkVerifyDto dto, CancellationToken ct)
    {
        var user = await authService.VerifyMagicLinkAsync(dto, HttpContext, ct);
        return Ok(user);
    }

    // ── OAuth Skeleton ──────────────────────────────────────────────────────

    [HttpGet("oauth/{provider}/authorize")]
    [AllowAnonymous]
    public IActionResult OAuthAuthorize(string provider)
    {
        var stubUrl = provider.ToLowerInvariant() switch
        {
            "github" => "https://github.com/login/oauth/authorize",
            _ => "https://accounts.google.com/o/oauth2/v2/auth"
        };

        return Ok(new
        {
            url = stubUrl,
            message = "OAuth no configurado en este entorno. Configure las credenciales en appsettings."
        });
    }

    [HttpGet("oauth/{provider}/callback")]
    [AllowAnonymous]
    public IActionResult OAuthCallback(string provider, [FromQuery] string? code, [FromQuery] string? state)
    {
        return BadRequest(new
        {
            message = $"OAuth callback no configurado. Proporcione credenciales reales de {provider}."
        });
    }
}
