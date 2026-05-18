namespace TaskManager.Api.Modules.Workspaces.Dtos;

public class CreateWorkspaceDto
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
}
