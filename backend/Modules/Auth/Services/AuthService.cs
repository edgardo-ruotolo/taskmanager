using AutoMapper;
using Microsoft.AspNetCore.Identity;
using TaskManager.Api.Common.Email;
using TaskManager.Api.Common.Exceptions;
using TaskManager.Api.Modules.Auth.Dtos;
using TaskManager.Api.Modules.Auth.Entities;

namespace TaskManager.Api.Modules.Auth.Services;

public class AuthService(
    UserManager<User> userManager,
    SignInManager<User> signInManager,
    IMapper mapper,
    IEmailService emailService) : IAuthService
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

        return await MapUserDtoAsync(user);
    }

    public async Task<UserDto> LoginAsync(LoginDto dto, HttpContext httpContext, CancellationToken ct = default)
    {
        var user = await userManager.FindByEmailAsync(dto.Email)
            ?? throw new NotFoundException("User not found.");

        var result = await signInManager.PasswordSignInAsync(user, dto.Password, isPersistent: true, lockoutOnFailure: false);
        if (!result.Succeeded)
            throw new ValidationException("Invalid credentials.");

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

        await emailService.SendPasswordResetAsync(user.Email!, resetLink, ct);
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

    private async Task<UserDto> MapUserDtoAsync(User user)
    {
        var dto = mapper.Map<UserDto>(user);
        dto.Roles = (await userManager.GetRolesAsync(user)).ToList();
        return dto;
    }
}
