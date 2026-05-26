using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Modules.Auth.Entities;
using TaskManager.Api.Modules.Workspaces.Entities;

namespace TaskManager.Api.Data.Seeders;

public static class WorkspaceBootstrapSeeder
{
    private const string WorkspaceName = "RBV Consultores";
    private const string WorkspaceSlug = "rbv-consultores";

    public static async Task SeedAsync(IServiceProvider services)
    {
        var db          = services.GetRequiredService<AppDbContext>();
        var userManager = services.GetRequiredService<UserManager<User>>();
        var config      = services.GetRequiredService<IConfiguration>();

        var adminEmail = config["Admin:Email"];
        if (string.IsNullOrWhiteSpace(adminEmail))
        {
            return;
        }

        var admin = await userManager.FindByEmailAsync(adminEmail);
        if (admin is null)
        {
            return;
        }

        var workspace = await db.Workspaces.IgnoreQueryFilters()
            .FirstOrDefaultAsync(w => w.Slug == WorkspaceSlug);

        if (workspace is null)
        {
            workspace = new Workspace
            {
                Name = WorkspaceName,
                Slug = WorkspaceSlug,
                OwnerId = admin.Id
            };
            db.Workspaces.Add(workspace);
            await db.SaveChangesAsync();
        }

        var hasMembership = await db.WorkspaceMembers.IgnoreQueryFilters()
            .AnyAsync(m => m.WorkspaceId == workspace.Id && m.UserId == admin.Id);

        if (!hasMembership)
        {
            db.WorkspaceMembers.Add(new WorkspaceMember
            {
                WorkspaceId = workspace.Id,
                UserId = admin.Id,
                Role = WorkspaceRole.Admin,
                IsActive = true
            });
            await db.SaveChangesAsync();
        }

        // El admin bootstrap entra directo al workspace pre-creado: no debe pasar
        // por el wizard de onboarding del frontend ('welcome' → 'profile' → 'workspace' → 'invite').
        if (admin.OnboardingCompletedAt is null)
        {
            admin.OnboardingCompletedAt = DateTime.UtcNow;
            admin.OnboardingCompletedSteps = new List<string> { "welcome", "profile", "workspace", "invite" };
            await userManager.UpdateAsync(admin);
        }
    }
}
