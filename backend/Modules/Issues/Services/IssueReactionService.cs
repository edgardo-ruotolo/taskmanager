using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Common.Exceptions;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Issues.Dtos;
using TaskManager.Api.Modules.Issues.Entities;

namespace TaskManager.Api.Modules.Issues.Services;

public class IssueReactionService(AppDbContext db, IMapper mapper) : IIssueReactionService
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
    }
}
