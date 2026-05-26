namespace TaskManager.Api.Modules.Workspaces.Dtos;

public record WorkspaceActivityDto(
    Guid Id,
    Guid WorkspaceId,
    Guid ActorId,
    string ActorName,
    string Action,
    string? EntityType,
    Guid? EntityId,
    string? EntityTitle,
    string? OldValue,
    string? NewValue,
    string? CommentBody,
    DateTime CreatedAt
);
