using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Common.Exceptions;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Favorites.Dtos;
using TaskManager.Api.Modules.Favorites.Entities;

namespace TaskManager.Api.Modules.Favorites.Services;

public class FavoriteService(AppDbContext db) : IFavoriteService
{
    public async Task<IEnumerable<FavoriteDto>> GetAllAsync(string workspaceSlug, Guid userId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces
            .FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException("Workspace not found");

        return await db.Favorites
            .Where(f => f.WorkspaceId == workspace.Id && f.UserId == userId && !f.IsDeleted)
            .OrderBy(f => f.Sequence)
            .Select(f => new FavoriteDto(f.Id, f.EntityType, f.EntityId, f.WorkspaceId, f.Sequence, f.CreatedAt))
            .ToListAsync(ct);
    }

    public async Task<FavoriteDto> CreateAsync(string workspaceSlug, Guid userId, CreateFavoriteDto dto, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces
            .FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException("Workspace not found");

        var existing = await db.Favorites
            .FirstOrDefaultAsync(f =>
                f.WorkspaceId == workspace.Id &&
                f.UserId == userId &&
                f.EntityType == dto.EntityType &&
                f.EntityId == dto.EntityId &&
                !f.IsDeleted, ct);

        if (existing is not null)
            return new FavoriteDto(existing.Id, existing.EntityType, existing.EntityId, existing.WorkspaceId, existing.Sequence, existing.CreatedAt);

        var maxSeq = await db.Favorites
            .Where(f => f.WorkspaceId == workspace.Id && f.UserId == userId && !f.IsDeleted)
            .Select(f => (int?)f.Sequence)
            .MaxAsync(ct) ?? -1;

        var favorite = new Favorite
        {
            UserId = userId,
            EntityType = dto.EntityType,
            EntityId = dto.EntityId,
            WorkspaceId = workspace.Id,
            Sequence = maxSeq + 1,
        };

        db.Favorites.Add(favorite);
        await db.SaveChangesAsync(ct);

        return new FavoriteDto(favorite.Id, favorite.EntityType, favorite.EntityId, favorite.WorkspaceId, favorite.Sequence, favorite.CreatedAt);
    }

    public async Task DeleteAsync(Guid id, Guid userId, CancellationToken ct = default)
    {
        var favorite = await db.Favorites
            .FirstOrDefaultAsync(f => f.Id == id && f.UserId == userId && !f.IsDeleted, ct)
            ?? throw new NotFoundException("Favorite not found");

        favorite.IsDeleted = true;
        favorite.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
    }
}
