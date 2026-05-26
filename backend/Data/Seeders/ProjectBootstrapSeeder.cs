using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Modules.Auth.Entities;
using TaskManager.Api.Modules.Projects.Entities;
using TaskManager.Api.Modules.States.Entities;

namespace TaskManager.Api.Data.Seeders;

public static class ProjectBootstrapSeeder
{
    private const string WorkspaceSlug = "rbv-consultores";
    private const string ProjectName = "Fluentoc";
    private const string ProjectIdentifier = "FLU";

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
            return;
        }

        var stateGroup = await db.StateGroups.IgnoreQueryFilters()
            .FirstOrDefaultAsync(g => g.IsDefault);

        if (stateGroup is null)
        {
            return;
        }

        var existingProject = await db.Projects.IgnoreQueryFilters()
            .FirstOrDefaultAsync(p => p.WorkspaceId == workspace.Id
                                      && p.Identifier == ProjectIdentifier);

        if (existingProject is not null)
        {
            return;
        }

        var project = new Project
        {
            Name = ProjectName,
            Identifier = ProjectIdentifier,
            WorkspaceId = workspace.Id,
            OwnerId = admin.Id,
            StateGroupId = stateGroup.Id,
            IsArchived = false
        };

        db.Projects.Add(project);
        await db.SaveChangesAsync();

        db.ProjectMembers.Add(new ProjectMember
        {
            ProjectId = project.Id,
            UserId = admin.Id,
            Role = ProjectRole.Admin
        });
        await db.SaveChangesAsync();
    }
}
