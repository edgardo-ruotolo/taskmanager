using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Modules.Auth.Entities;

namespace TaskManager.Api.Data.Seeders;

public static class AdminUserSeeder
{
    public const string AdminRole = "Admin";

    public static async Task SeedAsync(IServiceProvider services)
    {
        var userManager = services.GetRequiredService<UserManager<User>>();
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
        var config      = services.GetRequiredService<IConfiguration>();

        if (!await roleManager.RoleExistsAsync(AdminRole))
            await roleManager.CreateAsync(new IdentityRole<Guid>(AdminRole));

        var email     = config["Admin:Email"]     ?? string.Empty;
        var username  = config["Admin:Username"]  ?? string.Empty;
        var password  = config["Admin:Password"]  ?? string.Empty;
        var firstName = config["Admin:FirstName"] ?? string.Empty;
        var lastName  = config["Admin:LastName"]  ?? string.Empty;

        if (string.IsNullOrWhiteSpace(username)  ||
            string.IsNullOrWhiteSpace(email)     ||
            string.IsNullOrWhiteSpace(password)  ||
            string.IsNullOrWhiteSpace(firstName) ||
            string.IsNullOrWhiteSpace(lastName))
        {
            throw new InvalidOperationException(
                "Admin user seeding failed: Admin:Username, Admin:Email, Admin:Password, " +
                "Admin:FirstName and Admin:LastName are required in configuration.");
        }

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
}
