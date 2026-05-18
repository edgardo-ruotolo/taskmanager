using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Common.Exceptions;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Labels.Dtos;
using TaskManager.Api.Modules.Labels.Entities;

namespace TaskManager.Api.Modules.Labels.Services;

public class LabelService(AppDbContext db) : ILabelService
{
    public async Task<IEnumerable<LabelDto>> GetAllAsync(string workspaceSlug, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var labels = await db.Labels
            .Where(l => l.WorkspaceId == workspace.Id)
            .OrderBy(l => l.Name)
            .ToListAsync(ct);

        return labels.Select(MapToDto);
    }

    public async Task<LabelDto> GetByIdAsync(string workspaceSlug, Guid labelId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var label = await db.Labels
            .FirstOrDefaultAsync(l => l.Id == labelId && l.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Label not found.");

        return MapToDto(label);
    }

    public async Task<LabelDto> CreateAsync(string workspaceSlug, CreateLabelDto dto, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var nameExists = await db.Labels
            .AnyAsync(l => l.WorkspaceId == workspace.Id && l.Name == dto.Name, ct);

        if (nameExists)
            throw new ValidationException($"Label '{dto.Name}' already exists in this workspace.");

        var label = new Label
        {
            Name = dto.Name,
            Color = dto.Color,
            Description = dto.Description,
            WorkspaceId = workspace.Id
        };

        db.Labels.Add(label);
        await db.SaveChangesAsync(ct);

        return MapToDto(label);
    }

    public async Task<LabelDto> UpdateAsync(string workspaceSlug, Guid labelId, UpdateLabelDto dto, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var label = await db.Labels
            .FirstOrDefaultAsync(l => l.Id == labelId && l.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Label not found.");

        if (dto.Name is not null)
        {
            var nameExists = await db.Labels
                .AnyAsync(l => l.WorkspaceId == workspace.Id && l.Name == dto.Name && l.Id != labelId, ct);

            if (nameExists)
                throw new ValidationException($"Label '{dto.Name}' already exists in this workspace.");

            label.Name = dto.Name;
        }

        if (dto.Color is not null) label.Color = dto.Color;
        if (dto.Description is not null) label.Description = dto.Description;

        await db.SaveChangesAsync(ct);
        return MapToDto(label);
    }

    public async Task DeleteAsync(string workspaceSlug, Guid labelId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var label = await db.Labels
            .FirstOrDefaultAsync(l => l.Id == labelId && l.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Label not found.");

        label.IsDeleted = true;
        label.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
    }

    private static LabelDto MapToDto(Label label) => new()
    {
        Id = label.Id,
        Name = label.Name,
        Color = label.Color,
        Description = label.Description,
        WorkspaceId = label.WorkspaceId,
        CreatedAt = label.CreatedAt
    };
}
