using System.Security.Cryptography;
using System.Text;
using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Common.Exceptions;
using TaskManager.Api.Common.Notifications;
using TaskManager.Api.Common.Telemetry;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Auth.Dtos;
using TaskManager.Api.Modules.Auth.Entities;

namespace TaskManager.Api.Modules.Auth.Services;

public class AuthService(
    UserManager<User> userManager,
    SignInManager<User> signInManager,
    IMapper mapper,
    INotificationDispatcher notifications,
    AppDbContext db,
    ITelemetryProvider telemetry,
    IConfiguration configuration) : IAuthService
{
    private string FrontendBaseUrl =>
        configuration["App:FrontendUrl"]?.TrimEnd('/')
            ?? throw new InvalidOperationException("App:FrontendUrl is not configured.");

    private byte[] MagicLinkSecret
    {
        get
        {
            var secret = configuration["Auth:MagicLinkSecret"];
            if (string.IsNullOrWhiteSpace(secret))
                throw new InvalidOperationException("Auth:MagicLinkSecret is not configured.");
            return Encoding.UTF8.GetBytes(secret);
        }
    }

    private string HashMagicLinkToken(string rawToken)
    {
        using var hmac = new HMACSHA256(MagicLinkSecret);
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(rawToken));
        return Convert.ToBase64String(hash).TrimEnd('=').Replace('+', '-').Replace('/', '_');
    }

    private static string GenerateMagicLinkToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(32);
        return Convert.ToBase64String(bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_');
    }

    public async Task<UserDto> RegisterAsync(RegisterDto dto, CancellationToken ct = default)
    {
        var user = new User
        {
            Email = dto.Email,
            UserName = dto.Username,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            DisplayName = dto.FirstName is not null ? $"{dto.FirstName} {dto.LastName}".Trim() : dto.Username
        };

        var result = await userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new ValidationException(errors);
        }

        telemetry.IdentifyUser(user.Id.ToString(), new Dictionary<string, object> { ["email"] = user.Email! });

        return await MapUserDtoAsync(user);
    }

    public async Task<UserDto> LoginAsync(LoginDto dto, HttpContext httpContext, CancellationToken ct = default)
    {
        var user = await userManager.FindByEmailAsync(dto.Email)
            ?? throw new NotFoundException("User not found.");

        var result = await signInManager.PasswordSignInAsync(user, dto.Password, isPersistent: true, lockoutOnFailure: false);
        if (!result.Succeeded)
            throw new ValidationException("Invalid credentials.");

        telemetry.CaptureEvent("user_login", user.Id.ToString());

        return await MapUserDtoAsync(user);
    }

    public async Task LogoutAsync(HttpContext httpContext, CancellationToken ct = default)
        => await signInManager.SignOutAsync();

    public async Task<UserDto?> GetCurrentUserAsync(HttpContext httpContext, CancellationToken ct = default)
    {
        if (httpContext.User.Identity?.IsAuthenticated != true) return null;
        var user = await userManager.GetUserAsync(httpContext.User);
        return user is null ? null : await MapUserDtoAsync(user);
    }

    public async Task ForgotPasswordAsync(ForgotPasswordDto dto, CancellationToken ct = default)
    {
        var user = await userManager.FindByEmailAsync(dto.Email);
        if (user is null) return; // silently return — do not reveal if email exists

        var token = await userManager.GeneratePasswordResetTokenAsync(user);
        var encodedToken = Uri.EscapeDataString(token);
        var resetLink = $"{FrontendBaseUrl}/reset-password?email={Uri.EscapeDataString(user.Email!)}&token={encodedToken}";

        notifications.Enqueue(new EmailJobPayload
        {
            Kind = EmailJobKind.PasswordReset,
            RecipientUserId = user.Id,
            RecipientEmail = user.Email!,
            RecipientName = user.FirstName ?? user.UserName ?? string.Empty,
            Params = new Dictionary<string, object?>
            {
                ["firstName"] = user.FirstName ?? user.UserName ?? string.Empty,
                ["resetUrl"] = resetLink
            }
        });
    }

    public async Task ResetPasswordAsync(ResetPasswordDto dto, CancellationToken ct = default)
    {
        var user = await userManager.FindByEmailAsync(dto.Email)
            ?? throw new NotFoundException("User not found.");

        var decodedToken = Uri.UnescapeDataString(dto.Token);
        var result = await userManager.ResetPasswordAsync(user, decodedToken, dto.NewPassword);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new ValidationException(errors);
        }
    }

    public async Task<UserDto> ChangePasswordAsync(Guid userId, ChangePasswordDto dto, CancellationToken ct = default)
    {
        var user = await userManager.FindByIdAsync(userId.ToString())
            ?? throw new NotFoundException("User not found.");

        var result = await userManager.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new ValidationException(errors);
        }

        return await MapUserDtoAsync(user);
    }

    public async Task<UserDto> UpdateProfileAsync(Guid userId, UpdateProfileDto dto, CancellationToken ct = default)
    {
        var user = await userManager.FindByIdAsync(userId.ToString())
            ?? throw new NotFoundException("User not found.");

        if (dto.FirstName != null) user.FirstName = dto.FirstName;
        if (dto.LastName != null) user.LastName = dto.LastName;
        if (dto.DisplayName != null) user.DisplayName = dto.DisplayName;
        if (dto.AvatarUrl != null) user.AvatarUrl = dto.AvatarUrl;

        var result = await userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new ValidationException(errors);
        }

        return await MapUserDtoAsync(user);
    }

    public async Task DeactivateAccountAsync(Guid userId, HttpContext httpContext, CancellationToken ct = default)
    {
        var user = await userManager.FindByIdAsync(userId.ToString())
            ?? throw new NotFoundException("User not found.");

        user.IsActive = false;
        user.DeletedAt = DateTime.UtcNow;

        await userManager.UpdateAsync(user);
        await signInManager.SignOutAsync();
    }

    public async Task SendMagicLinkAsync(MagicLinkRequestDto dto, CancellationToken ct = default)
    {
        var user = await userManager.FindByEmailAsync(dto.Email);
        // Silently return if user not found — do not reveal if email exists
        if (user is null) return;

        var now = DateTime.UtcNow;

        // Invalidate any previous pending tokens for the same email — single active token at a time.
        await db.MagicLinkTokens
            .Where(t => t.Email == dto.Email && !t.IsUsed && t.ExpiresAt > now)
            .ExecuteUpdateAsync(s => s
                .SetProperty(t => t.IsUsed, true)
                .SetProperty(t => t.UsedAt, now), ct);

        var rawToken = GenerateMagicLinkToken();
        var magicLink = new MagicLinkToken
        {
            Email = dto.Email,
            TokenHash = HashMagicLinkToken(rawToken),
            ExpiresAt = now.AddMinutes(15)
        };

        db.MagicLinkTokens.Add(magicLink);
        await db.SaveChangesAsync(ct);

        var url = $"{FrontendBaseUrl}/magic-link/{rawToken}";
        var name = user.FirstName ?? user.UserName ?? string.Empty;
        notifications.Enqueue(new EmailJobPayload
        {
            Kind = EmailJobKind.MagicLink,
            RecipientUserId = user.Id,
            RecipientEmail = user.Email!,
            RecipientName = name,
            Params = new Dictionary<string, object?>
            {
                ["firstName"] = name,
                ["magicUrl"] = url
            }
        });
    }

    public async Task<UserDto> VerifyMagicLinkAsync(MagicLinkVerifyDto dto, HttpContext httpContext, CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;
        var tokenHash = HashMagicLinkToken(dto.Token);

        // Atomic check-and-set to prevent race conditions on magic link reuse
        var updated = await db.MagicLinkTokens
            .Where(t => t.TokenHash == tokenHash && !t.IsUsed && t.ExpiresAt > now)
            .ExecuteUpdateAsync(s => s
                .SetProperty(t => t.IsUsed, true)
                .SetProperty(t => t.UsedAt, now), ct);

        if (updated == 0)
            throw new ValidationException("Magic link is invalid or has expired.");

        var magicToken = await db.MagicLinkTokens
            .AsNoTracking()
            .FirstAsync(t => t.TokenHash == tokenHash, ct);

        var user = await userManager.FindByEmailAsync(magicToken.Email)
            ?? throw new NotFoundException("User not found.");

        // Sign in the user via cookie auth (same as normal login)
        await signInManager.SignInAsync(user, isPersistent: true);

        return await MapUserDtoAsync(user);
    }

    public async Task<UserDto?> RefreshSessionAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await userManager.FindByIdAsync(userId.ToString());
        if (user is null || !user.IsActive || user.IsDeleted) return null;

        // Re-sign-in to refresh claims in the auth cookie.
        await signInManager.SignInAsync(user, isPersistent: true);

        return await MapUserDtoAsync(user);
    }

    private async Task<UserDto> MapUserDtoAsync(User user)
    {
        var dto = mapper.Map<UserDto>(user);
        dto.Roles = (await userManager.GetRolesAsync(user)).ToList();
        dto.IsSuperAdmin = dto.Roles.Contains(Common.Authorization.AuthorizationExtensions.SuperAdminRole);
        return dto;
    }
}
