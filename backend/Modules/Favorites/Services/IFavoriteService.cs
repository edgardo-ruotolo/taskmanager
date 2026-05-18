using TaskManager.Api.Modules.Favorites.Dtos;

namespace TaskManager.Api.Modules.Favorites.Services;

public interface IFavoriteService
{
    Task<IEnumerable<FavoriteDto>> GetAllAsync(string workspaceSlug, Guid userId, CancellationToken ct = default);
    Task<FavoriteDto> CreateAsync(string workspaceSlug, Guid userId, CreateFavoriteDto dto, CancellationToken ct = default);
    Task DeleteAsync(Guid id, Guid userId, CancellationToken ct = default);
}
