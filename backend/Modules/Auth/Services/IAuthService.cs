using TaskManager.Api.Modules.Auth.Dtos;

namespace TaskManager.Api.Modules.Auth.Services;

public interface IAuthService
{
    Task<UserDto> RegisterAsync(RegisterDto dto, CancellationToken ct = default);
    Task<UserDto> LoginAsync(LoginDto dto, HttpContext httpContext, CancellationToken ct = default);
    Task LogoutAsync(HttpContext httpContext, CancellationToken ct = default);
    Task<UserDto?> GetCurrentUserAsync(HttpContext httpContext, CancellationToken ct = default);
    Task ForgotPasswordAsync(ForgotPasswordDto dto, CancellationToken ct = default);
    Task ResetPasswordAsync(ResetPasswordDto dto, CancellationToken ct = default);
    Task<UserDto> ChangePasswordAsync(Guid userId, ChangePasswordDto dto, CancellationToken ct = default);
    Task<UserDto> UpdateProfileAsync(Guid userId, UpdateProfileDto dto, CancellationToken ct = default);
    Task DeactivateAccountAsync(Guid userId, HttpContext httpContext, CancellationToken ct = default);
    Task SendMagicLinkAsync(MagicLinkRequestDto dto, CancellationToken ct = default);
    Task<UserDto> VerifyMagicLinkAsync(MagicLinkVerifyDto dto, HttpContext httpContext, CancellationToken ct = default);
}
