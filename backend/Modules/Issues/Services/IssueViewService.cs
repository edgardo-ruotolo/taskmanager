using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Common.Exceptions;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Issues.Dtos;
using TaskManager.Api.Modules.Issues.Entities;

namespace TaskManager.Api.Modules.Issues.Services;

public class IssueViewService(AppDbContext db, IMapper mapper) : IIssueViewService
{
    public async Task<IEnumerable<IssueViewDto>> GetAllAsync(string workspaceSlug, Guid? projectId, Guid userId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var query = db.IssueViews
            .Where(v => v.WorkspaceId == workspace.Id &&
                        (v.IsPublic || v.OwnerId == userId));

        if (projectId.HasValue)
            query = query.Where(v => v.ProjectId == projectId.Value);

        var views = await query.OrderBy(v => v.Name).ToListAsync(ct);
        return mapper.Map<IEnumerable<IssueViewDto>>(views);
    }

    public async Task<IssueViewDto> GetByIdAsync(Guid id, Guid userId, CancellationToken ct = default)
    {
        var view = await db.IssueViews.FirstOrDefaultAsync(v => v.Id == id, ct)
            ?? throw new NotFoundException("View not found.");

        if (!view.IsPublic && view.OwnerId != userId)
            throw new ForbiddenException("Access denied.");

        return mapper.Map<IssueViewDto>(view);
    }

    public async Task<IssueViewDto> CreateAsync(string workspaceSlug, Guid userId, CreateIssueViewDto dto, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var view = new IssueView
        {
            Name = dto.Name,
            Description = dto.Description,
            WorkspaceId = workspace.Id,
            ProjectId = dto.ProjectId,
            OwnerId = userId,
            IsPublic = dto.IsPublic,
            FiltersJson = dto.FiltersJson,
            DisplayPropertiesJson = dto.DisplayPropertiesJson,
            Layout = dto.Layout
        };

        db.IssueViews.Add(view);
        await db.SaveChangesAsync(ct);

        return mapper.Map<IssueViewDto>(view);
    }

    public async Task<IssueViewDto> UpdateAsync(Guid id, Guid userId, UpdateIssueViewDto dto, CancellationToken ct = default)
    {
        var view = await db.IssueViews.FirstOrDefaultAsync(v => v.Id == id, ct)
            ?? throw new NotFoundException("View not found.");

        if (view.OwnerId != userId)
            throw new ForbiddenException("Only the owner can update this view.");

        if (dto.Name is not null) view.Name = dto.Name;
        if (dto.Description is not null) view.Description = dto.Description;
        if (dto.IsPublic.HasValue) view.IsPublic = dto.IsPublic.Value;
        if (dto.FiltersJson is not null) view.FiltersJson = dto.FiltersJson;
        if (dto.DisplayPropertiesJson is not null) view.DisplayPropertiesJson = dto.DisplayPropertiesJson;
        if (dto.Layout is not null) view.Layout = dto.Layout;

        await db.SaveChangesAsync(ct);
        return mapper.Map<IssueViewDto>(view);
    }

    public async Task DeleteAsync(Guid id, Guid userId, CancellationToken ct = default)
    {
        var view = await db.IssueViews.FirstOrDefaultAsync(v => v.Id == id, ct)
            ?? throw new NotFoundException("View not found.");

        if (view.OwnerId != userId)
            throw new ForbiddenException("Only the owner can delete this view.");

        view.IsDeleted = true;
        view.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
    }
}
