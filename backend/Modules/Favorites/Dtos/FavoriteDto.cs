namespace TaskManager.Api.Modules.Favorites.Dtos;

public record FavoriteDto(Guid Id, string EntityType, Guid EntityId, Guid WorkspaceId, int Sequence, DateTime CreatedAt);

public record CreateFavoriteDto(string EntityType, Guid EntityId);
