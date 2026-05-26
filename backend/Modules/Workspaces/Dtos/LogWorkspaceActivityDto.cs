namespace TaskManager.Api.Modules.Workspaces.Dtos;

public record LogWorkspaceActivityDto(
    string Action,
    string? EntityType,
    Guid? EntityId,
    string? EntityTitle,
    string? OldValue,
    string? NewValue,
    string? CommentBody
);
