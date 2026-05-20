using AutoMapper;
using Ganss.Xss;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Common.Exceptions;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Issues.Dtos;
using TaskManager.Api.Modules.Issues.Entities;

namespace TaskManager.Api.Modules.Issues.Services;

public class IssueCommentService(AppDbContext db, IMapper mapper, IHtmlSanitizer htmlSanitizer) : IIssueCommentService
{
    public async Task<List<IssueCommentDto>> GetCommentsAsync(Guid issueId, CancellationToken ct = default)
    {
        var comments = await db.IssueComments
            .Include(c => c.Author)
            .Where(c => c.IssueId == issueId)
            .OrderBy(c => c.CreatedAt)
            .ToListAsync(ct);

        return mapper.Map<List<IssueCommentDto>>(comments);
    }

    public async Task<IssueCommentDto> CreateCommentAsync(Guid issueId, Guid authorId, CreateCommentDto dto, CancellationToken ct = default)
    {
        var comment = mapper.Map<IssueComment>(dto);
        comment.IssueId = issueId;
        comment.AuthorId = authorId;

        if (!string.IsNullOrEmpty(comment.Body))
            comment.Body = htmlSanitizer.Sanitize(comment.Body);

        db.IssueComments.Add(comment);
        await db.SaveChangesAsync(ct);

        await db.Entry(comment).Reference(c => c.Author).LoadAsync(ct);

        return mapper.Map<IssueCommentDto>(comment);
    }

    public async Task DeleteCommentAsync(Guid commentId, Guid requesterId, CancellationToken ct = default)
    {
        var comment = await db.IssueComments.FindAsync([commentId], ct)
            ?? throw new NotFoundException("Comment not found.");

        if (comment.AuthorId != requesterId)
            throw new ForbiddenException("You are not allowed to delete this comment.");

        comment.IsDeleted = true;
        comment.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
    }
}
