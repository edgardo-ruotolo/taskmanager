using Hangfire;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Data;

namespace TaskManager.Api.Modules.Recurring.Services;

public class RecurringDispatcher(AppDbContext db, IBackgroundJobClient backgroundJobClient) : IRecurringDispatcher
{
    public async Task DispatchDueTemplatesAsync(CancellationToken ct = default)
    {
        var dueTemplates = await db.RecurringIssueTemplates
            .Where(t => t.IsActive && !t.IsPaused && t.NextRunAt <= DateTime.UtcNow)
            .Select(t => t.Id)
            .ToListAsync(ct);

        foreach (var templateId in dueTemplates)
            backgroundJobClient.Enqueue<IRecurringExecutor>(e => e.ExecuteAsync(templateId, CancellationToken.None));
    }
}
