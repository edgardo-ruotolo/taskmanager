namespace TaskManager.Api.Modules.Workspaces.Dtos;

public class WorkspaceUserSearchDto
{
    public Guid UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string? DisplayName { get; set; }
    public string? AvatarUrl { get; set; }
}
