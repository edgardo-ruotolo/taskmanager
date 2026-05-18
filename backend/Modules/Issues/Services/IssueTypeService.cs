using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Common.Exceptions;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Issues.Dtos;
using TaskManager.Api.Modules.Issues.Entities;

namespace TaskManager.Api.Modules.Issues.Services;

public class IssueTypeService(AppDbContext db, IMapper mapper) : IIssueTypeService
{
    public async Task<List<IssueTypeDto>> GetTypesAsync(Guid workspaceId, CancellationToken ct = default)
    {
        var types = await db.IssueTypes
            .Where(t => t.WorkspaceId == workspaceId)
            .OrderBy(t => t.Name)
            .ToListAsync(ct);

        return mapper.Map<List<IssueTypeDto>>(types);
    }

    public async Task<IssueTypeDto> CreateTypeAsync(Guid workspaceId, CreateIssueTypeDto dto, CancellationToken ct = default)
    {
        var issueType = mapper.Map<IssueType>(dto);
        issueType.WorkspaceId = workspaceId;

        if (string.IsNullOrWhiteSpace(issueType.Color))
            issueType.Color = "#6b7280";

        db.IssueTypes.Add(issueType);
        await db.SaveChangesAsync(ct);

        return mapper.Map<IssueTypeDto>(issueType);
    }

    public async Task DeleteTypeAsync(Guid typeId, CancellationToken ct = default)
    {
        var issueType = await db.IssueTypes.FirstOrDefaultAsync(t => t.Id == typeId, ct)
            ?? throw new NotFoundException("Issue type not found.");

        issueType.IsDeleted = true;
        issueType.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
    }
}
