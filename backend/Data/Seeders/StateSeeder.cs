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

        if (await db.States.IgnoreQueryFilters().AnyAsync()) return;

        var states = new List<State>
        {
            new() { Name = "Backlog",     Color = "#94a3b8", Category = StateCategory.Backlog,    Sequence = 10000f, IsDefault = false, StateGroupId = defaultGroup.Id },
            new() { Name = "Todo",        Color = "#64748b", Category = StateCategory.Unstarted,  Sequence = 20000f, IsDefault = true,  StateGroupId = defaultGroup.Id },
            new() { Name = "In Progress", Color = "#3b82f6", Category = StateCategory.Started,    Sequence = 30000f, IsDefault = false, StateGroupId = defaultGroup.Id },
            new() { Name = "In Review",   Color = "#f59e0b", Category = StateCategory.Started,    Sequence = 40000f, IsDefault = false, StateGroupId = defaultGroup.Id },
            new() { Name = "Done",        Color = "#22c55e", Category = StateCategory.Completed,  Sequence = 50000f, IsDefault = false, StateGroupId = defaultGroup.Id },
            new() { Name = "Cancelled",   Color = "#ef4444", Category = StateCategory.Cancelled,  Sequence = 60000f, IsDefault = false, StateGroupId = defaultGroup.Id }
        };

        db.States.AddRange(states);
        await db.SaveChangesAsync();
    }
}
