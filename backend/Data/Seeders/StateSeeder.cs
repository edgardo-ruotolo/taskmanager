using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Modules.States.Entities;

namespace TaskManager.Api.Data.Seeders;

public static class StateSeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        var db = services.GetRequiredService<AppDbContext>();

        var defaultGroup = await db.StateGroups.IgnoreQueryFilters()
            .FirstOrDefaultAsync(g => g.IsDefault);

        if (defaultGroup is null)
        {
            defaultGroup = new StateGroup
            {
                Name = "Estados Básicos",
                IsDefault = true
            };
            db.StateGroups.Add(defaultGroup);
            await db.SaveChangesAsync();
        }

        var seedStates = new List<(string Name, string Color, StateCategory Category, float Sequence, bool IsDefault)>
        {
            ("Backlog",     "#94a3b8", StateCategory.Backlog,    10000f, false),
            ("Todo",        "#64748b", StateCategory.Unstarted,  20000f, true),
            ("In Progress", "#3b82f6", StateCategory.Started,    30000f, false),
            ("In Review",   "#f59e0b", StateCategory.Started,    40000f, false),
            ("Done",        "#22c55e", StateCategory.Completed,  50000f, false),
            ("Cancelled",   "#ef4444", StateCategory.Cancelled,  60000f, false),
        };

        var existingNames = await db.States.IgnoreQueryFilters()
            .Select(s => s.Name)
            .ToHashSetAsync();

        var toInsert = seedStates
            .Where(s => !existingNames.Contains(s.Name))
            .Select(s => new State
            {
                Name = s.Name,
                Color = s.Color,
                Category = s.Category,
                Sequence = s.Sequence,
                IsDefault = s.IsDefault,
                StateGroupId = defaultGroup.Id
            })
            .ToList();

        if (toInsert.Count > 0)
        {
            db.States.AddRange(toInsert);
            await db.SaveChangesAsync();
        }
    }
}
