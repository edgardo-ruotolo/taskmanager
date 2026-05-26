using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using TaskManager.Api.Common.Auth;
using Microsoft.AspNetCore.RateLimiting;
using TaskManager.Api.Modules.Auth.Dtos;
using TaskManager.Api.Modules.Auth.Services;
// MagicLinkRequestDto and MagicLinkVerifyDto are in the same Dtos namespace

namespace TaskManager.Api.Modules.Auth.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(
    IAuthService authService,
    ICurrentUser currentUser,
    IRefreshTokenService refreshTokenService,
    IWebHostEnvironment env,
    IConfiguration configuration) : ControllerBase
{
    private const string RefreshCookieName = "refresh_token";
    private const string RefreshCookiePath = "/api/auth";

    private void IssueRefreshCookie(string token, DateTime expiresAt)
    {
        var secure = configuration.GetValue<bool?>("Auth:CookieSecure") ?? !env.IsDevelopment();
        Response.Cookies.Append(RefreshCookieName, token, new CookieOptions
        {
            HttpOnly = true,
            Secure = secure,
            SameSite = SameSiteMode.Lax,
            Expires = expiresAt,
            Path = RefreshCookiePath
        });
    }

    private void DeleteRefreshCookie()
    {
        Response.Cookies.Delete(RefreshCookieName, new CookieOptions
        {
            Path = RefreshCookiePath
        });
    }

    private string? RemoteIp => HttpContext.Connection.RemoteIpAddress?.ToString();

    [HttpPost("register")]
    [EnableRateLimiting("auth-login")]
    public async Task<ActionResult<UserDto>> Register([FromBody] RegisterDto dto, CancellationToken ct)
    {
        var user = await authService.RegisterAsync(dto, ct);
        return Ok(user);
    }

    [HttpPost("login")]
    [EnableRateLimiting("auth-login")]
    public async Task<ActionResult<UserDto>> Login([FromBody] LoginDto dto, CancellationToken ct)
    {
        var user = await authService.LoginAsync(dto, HttpContext, ct);

        var (token, expiresAt) = await refreshTokenService.IssueAsync(user.Id, RemoteIp, ct);
        IssueRefreshCookie(token, expiresAt);

        return Ok(user);
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    [EnableRateLimiting("auth-password")]
    public async Task<ActionResult<UserDto>> Refresh(CancellationToken ct)
    {
        var presented = Request.Cookies[RefreshCookieName];
        if (string.IsNullOrWhiteSpace(presented)) return Unauthorized();

        var result = await refreshTokenService.RotateAsync(presented, RemoteIp, ct);
        if (result is null)
        {
            DeleteRefreshCookie();
            return Unauthorized();
        }

        var (userId, newToken, newExpiresAt) = result.Value;
        IssueRefreshCookie(newToken, newExpiresAt);

        var user = await authService.RefreshSessionAsync(userId, ct);
        if (user is null) return Unauthorized();
        return Ok(user);
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout(CancellationToken ct)
    {
        var presented = Request.Cookies[RefreshCookieName];
        if (!string.IsNullOrWhiteSpace(presented))
            await refreshTokenService.RevokeAsync(presented, RemoteIp, ct);

        await authService.LogoutAsync(HttpContext, ct);
        DeleteRefreshCookie();
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
    [EnableRateLimiting("auth-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto, CancellationToken ct)
    {
        await authService.ForgotPasswordAsync(dto, ct);
        return Ok(new { message = "Si el email existe, recibirás un enlace de recuperación." });
    }

    [HttpPost("reset-password")]
    [AllowAnonymous]
    [EnableRateLimiting("auth-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto, CancellationToken ct)
    {
        await authService.ResetPasswordAsync(dto, ct);
        return Ok(new { message = "Contraseña restablecida correctamente." });
    }

    [HttpPut("profile")]
    [Authorize]
    public async Task<ActionResult<UserDto>> UpdateProfile([FromBody] UpdateProfileDto dto, CancellationToken ct)
    {
        var user = await authService.UpdateProfileAsync(currentUser.UserId, dto, ct);
        return Ok(user);
    }

    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto, CancellationToken ct)
    {
        await authService.ChangePasswordAsync(currentUser.UserId, dto, ct);
        return Ok(new { message = "Contraseña actualizada correctamente." });
    }

    [HttpDelete("me")]
    [Authorize]
    public async Task<IActionResult> DeactivateAccount(CancellationToken ct)
    {
        await authService.DeactivateAccountAsync(currentUser.UserId, HttpContext, ct);
        return NoContent();
    }

    // ── Magic Link ──────────────────────────────────────────────────────────

    [HttpPost("magic-link")]
    [AllowAnonymous]
    [EnableRateLimiting("auth-password")]
    public async Task<IActionResult> RequestMagicLink([FromBody] MagicLinkRequestDto dto, CancellationToken ct)
    {
        await authService.SendMagicLinkAsync(dto, ct);
        return Ok(new { message = "Si el email existe, recibirás un enlace." });
    }

    [HttpPost("magic-link/verify")]
    [AllowAnonymous]
    [EnableRateLimiting("auth-password")]
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
