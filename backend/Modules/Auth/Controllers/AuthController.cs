using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Api.Modules.Auth.Dtos;
using TaskManager.Api.Modules.Auth.Services;

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
}
