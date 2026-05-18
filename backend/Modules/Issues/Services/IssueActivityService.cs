using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Issues.Dtos;
using TaskManager.Api.Modules.Issues.Entities;

namespace TaskManager.Api.Modules.Issues.Services;

public class IssueActivityService(AppDbContext db, IMapper mapper) : IIssueActivityService
{
    public async Task<List<IssueActivityDto>> GetActivitiesAsync(Guid issueId, CancellationToken ct = default)
    {
        var activities = await db.IssueActivities
            .Include(a => a.Actor)
            .Where(a => a.IssueId == issueId)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync(ct);

        return mapper.Map<List<IssueActivityDto>>(activities);
    }

    public async Task LogActivityAsync(Guid issueId, Guid actorId, string field, string? oldValue, string? newValue, CancellationToken ct = default)
    {
        var activity = new IssueActivity
        {
            IssueId = issueId,
            ActorId = actorId,
            Field = field,
            OldValue = oldValue,
            NewValue = newValue
        };

        db.IssueActivities.Add(activity);
        await db.SaveChangesAsync(ct);
    }
}
