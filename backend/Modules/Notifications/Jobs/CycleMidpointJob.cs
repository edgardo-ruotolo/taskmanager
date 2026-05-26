using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Common.Notifications;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Cycles.Entities;

namespace TaskManager.Api.Modules.Notifications.Jobs;

/// <summary>
/// Hourly Hangfire recurring job — emails the cycle Lead+Owner when the cycle
/// has crossed its midpoint and no midpoint email has been sent yet.
/// Idempotency: <c>Cycle.MidpointNotifiedAt</c>.
/// </summary>
public class CycleMidpointJob(
    AppDbContext db,
    INotificationDispatcher notifications,
    IConfiguration configuration,
    ILogger<CycleMidpointJob> logger)
{
    public const string RecurringJobId = "notifications-cycle-midpoint";

    public async Task RunAsync(CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        var frontendUrl = configuration["App:FrontendUrl"]?.TrimEnd('/') ?? "";

        var candidates = await db.Cycles
            .IgnoreQueryFilters()
            .Where(c => !c.IsDeleted && !c.IsArchived
                && c.Status == CycleStatus.Started
                && c.MidpointNotifiedAt == null
                && c.StartDate != null && c.EndDate != null
                && c.StartDate < now && c.EndDate > now)
            .Include(c => c.Owner)
            .Include(c => c.Lead)
            .Include(c => c.Project)
            .ToListAsync(ct);

        var dispatched = 0;
        foreach (var cycle in candidates)
        {
            var start = cycle.StartDate!.Value;
            var end = cycle.EndDate!.Value;
            var midpoint = start.AddTicks((end - start).Ticks / 2);
            if (now < midpoint) continue;

            var recipients = new List<(Guid Id, string? Email, string? Name)>();
            recipients.Add((cycle.OwnerId, cycle.Owner.Email, cycle.Owner.FirstName ?? cycle.Owner.UserName));
            if (cycle.LeadId.HasValue && cycle.LeadId != cycle.OwnerId && cycle.Lead is not null)
                recipients.Add((cycle.LeadId.Value, cycle.Lead.Email, cycle.Lead.FirstName ?? cycle.Lead.UserName));

            var totalIssues = await db.CycleIssues.CountAsync(ci => ci.CycleId == cycle.Id, ct);
            var completedIssues = await db.CycleIssues
                .Where(ci => ci.CycleId == cycle.Id)
                .Select(ci => ci.Issue)
                .CountAsync(i => i.CompletedAt != null, ct);

            foreach (var r in recipients)
            {
                if (string.IsNullOrWhiteSpace(r.Email)) continue;
                notifications.Enqueue(new EmailJobPayload
                {
                    Kind = EmailJobKind.LeaderCycleMidpoint,
                    RecipientUserId = r.Id,
                    RecipientEmail = r.Email!,
                    RecipientName = r.Name ?? string.Empty,
                    EntityId = cycle.Id,
                    Params = new Dictionary<string, object?>
                    {
                        ["firstName"] = r.Name,
                        ["cycleName"] = cycle.Name,
                        ["projectName"] = cycle.Project.Name,
                        ["startDate"] = start.ToString("yyyy-MM-dd"),
                        ["endDate"] = end.ToString("yyyy-MM-dd"),
                        ["totalIssues"] = totalIssues,
                        ["completedIssues"] = completedIssues,
                        ["pendingIssues"] = totalIssues - completedIssues,
                        ["cycleUrl"] = $"{frontendUrl}/projects/{cycle.ProjectId}/cycles/{cycle.Id}"
                    }
                });
            }

            cycle.MidpointNotifiedAt = now;
            dispatched++;
        }

        if (dispatched > 0)
        {
            await db.SaveChangesAsync(ct);
            logger.LogInformation("CycleMidpointJob: notified {Count} cycles", dispatched);
        }
    }
}
