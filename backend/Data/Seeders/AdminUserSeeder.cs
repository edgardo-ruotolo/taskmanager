using System.Net.Mail;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Auth.Entities;

namespace TaskManager.Api.Data.Seeders;

public static class AdminUserSeeder
{
    public const string AdminRole = "SuperAdmin";
    public const string WorkspaceAdminRole = "Administrador";
    private const string LegacyAdminRole = "Admin";

    public static async Task SeedAsync(IServiceProvider services)
    {
        var userManager = services.GetRequiredService<UserManager<User>>();
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
        var db          = services.GetRequiredService<AppDbContext>();
        var config      = services.GetRequiredService<IConfiguration>();

        // Idempotent rename: if a legacy "Admin" role exists, rename it to "SuperAdmin".
        var legacy = await roleManager.FindByNameAsync(LegacyAdminRole);
        if (legacy is not null && !await roleManager.RoleExistsAsync(AdminRole))
        {
            legacy.Name = AdminRole;
            legacy.NormalizedName = AdminRole.ToUpperInvariant();
            await roleManager.UpdateAsync(legacy);
        }

        if (!await roleManager.RoleExistsAsync(AdminRole))
            await roleManager.CreateAsync(new IdentityRole<Guid>(AdminRole));

        if (!await roleManager.RoleExistsAsync(WorkspaceAdminRole))
            await roleManager.CreateAsync(new IdentityRole<Guid>(WorkspaceAdminRole));

        // If users already exist, the admin bootstrap is irrelevant on subsequent starts.
        var hasAnyUser = await db.Users.IgnoreQueryFilters().AnyAsync();
        if (hasAnyUser) return;

        var email     = Require(config, "Admin:Email");
        var username  = Require(config, "Admin:Username");
        var password  = Require(config, "Admin:Password");
        var firstName = Require(config, "Admin:FirstName");
        var lastName  = Require(config, "Admin:LastName");

        if (!IsValidEmail(email))
            throw new InvalidOperationException($"Admin:Email '{email}' is not a valid email address.");

        // Si el usuario configurado ya existe, asegurarse de que tenga el rol Admin.
        var existingUser = await userManager.FindByEmailAsync(email);
        if (existingUser is not null)
        {
            if (!await userManager.IsInRoleAsync(existingUser, AdminRole))
                await userManager.AddToRoleAsync(existingUser, AdminRole);
            return;
        }

        // No existe ningún usuario con ese email: crearlo.
        var admin = new User
        {
            UserName       = username,
            Email          = email,
            FirstName      = firstName,
            LastName       = lastName,
            DisplayName    = $"{firstName} {lastName}",
            IsActive       = true,
            EmailConfirmed = true
        };

        var result = await userManager.CreateAsync(admin, password);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new InvalidOperationException($"Failed to create admin user: {errors}");
        }

        await userManager.AddToRoleAsync(admin, AdminRole);
    }

    private static string Require(IConfiguration config, string key)
    {
        var value = config[key];
        if (string.IsNullOrWhiteSpace(value))
            throw new InvalidOperationException($"{key} is not configured. Set it via appsettings or environment variables.");
        return value;
    }

    private static bool IsValidEmail(string email)
    {
        if (!MailAddress.TryCreate(email, out var address)) return false;
        return address.Address == email;
    }
}
