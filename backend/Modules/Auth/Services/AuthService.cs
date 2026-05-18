using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Common.Email;
using TaskManager.Api.Common.Exceptions;
using TaskManager.Api.Common.Telemetry;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Auth.Dtos;
using TaskManager.Api.Modules.Auth.Entities;

namespace TaskManager.Api.Modules.Auth.Services;

public class AuthService(
    UserManager<User> userManager,
    SignInManager<User> signInManager,
    IMapper mapper,
    IEmailService emailService,
    AppDbContext db,
    ITelemetryProvider telemetry) : IAuthService
{
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
        var resetLink = $"http://localhost:5173/reset-password?email={Uri.EscapeDataString(user.Email!)}&token={encodedToken}";

        await emailService.SendPasswordResetAsync(user.Email!, user.FirstName ?? user.UserName ?? string.Empty, resetLink, ct);
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

        var token = Guid.NewGuid().ToString("N");
        var magicLink = new MagicLinkToken
        {
            Email = dto.Email,
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddMinutes(15)
        };

        db.MagicLinkTokens.Add(magicLink);
        await db.SaveChangesAsync(ct);

        var url = $"http://localhost:3000/magic-link/{token}";
        var name = user.FirstName ?? user.UserName ?? string.Empty;
        await emailService.SendMagicLinkAsync(user.Email!, name, url, ct);
    }

    public async Task<UserDto> VerifyMagicLinkAsync(MagicLinkVerifyDto dto, HttpContext httpContext, CancellationToken ct = default)
    {
        var magicToken = await db.MagicLinkTokens
            .FirstOrDefaultAsync(t => t.Token == dto.Token, ct);

        if (magicToken is null || magicToken.IsUsed || magicToken.ExpiresAt < DateTime.UtcNow)
            throw new ValidationException("Magic link is invalid or has expired.");

        var user = await userManager.FindByEmailAsync(magicToken.Email)
            ?? throw new NotFoundException("User not found.");

        // Mark token as used
        magicToken.IsUsed = true;
        magicToken.UsedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);

        // Sign in the user via cookie auth (same as normal login)
        await signInManager.SignInAsync(user, isPersistent: true);

        return await MapUserDtoAsync(user);
    }

    private async Task<UserDto> MapUserDtoAsync(User user)
    {
        var dto = mapper.Map<UserDto>(user);
        dto.Roles = (await userManager.GetRolesAsync(user)).ToList();
        return dto;
    }
}
