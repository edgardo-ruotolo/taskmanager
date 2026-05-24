using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Common.Exceptions;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Issues.Dtos;
using TaskManager.Api.Modules.Issues.Entities;
using TaskManager.Api.Modules.Realtime;
using TaskManager.Api.Modules.Realtime.Contracts;

namespace TaskManager.Api.Modules.Issues.Services;

public class IssueReactionService(AppDbContext db, IMapper mapper, IRealtimePublisher realtime) : IIssueReactionService
{
    public async Task<List<IssueReactionDto>> GetReactionsAsync(Guid issueId, CancellationToken ct = default)
    {
        var reactions = await db.IssueReactions
            .Where(r => r.IssueId == issueId)
            .ToListAsync(ct);

        return mapper.Map<List<IssueReactionDto>>(reactions);
    }

    public async Task<IssueReactionDto> AddReactionAsync(Guid issueId, Guid actorId, CreateReactionDto dto, CancellationToken ct = default)
    {
        var reaction = mapper.Map<IssueReaction>(dto);
        reaction.IssueId = issueId;
        reaction.ActorId = actorId;

        db.IssueReactions.Add(reaction);
        await db.SaveChangesAsync(ct);

        await EmitReactionChangedAsync(issueId, actorId, ct);

        return mapper.Map<IssueReactionDto>(reaction);
    }

    public async Task RemoveReactionAsync(Guid issueId, Guid actorId, string emoji, CancellationToken ct = default)
    {
        var reaction = await db.IssueReactions
            .FirstOrDefaultAsync(r => r.IssueId == issueId && r.ActorId == actorId && r.Emoji == emoji, ct)
            ?? throw new NotFoundException("Reaction not found.");

        reaction.IsDeleted = true;
        reaction.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);

        await EmitReactionChangedAsync(issueId, actorId, ct);
    }

    private async Task EmitReactionChangedAsync(Guid issueId, Guid actorId, CancellationToken ct)
    {
        var projectId = await db.Issues.AsNoTracking()
            .Where(i => i.Id == issueId)
            .Select(i => i.ProjectId)
            .FirstOrDefaultAsync(ct);

        if (projectId == Guid.Empty) return;

        var evt = new RealtimeEvent("reaction.changed", string.Empty, projectId, issueId, actorId, DateTimeOffset.UtcNow);
        await realtime.PublishToProjectAsync(projectId, evt, ct);
        await realtime.PublishToIssueAsync(issueId, evt, ct);
    }
}
