namespace TaskManager.Api.Modules.Workspaces.Dtos;

public class WorkspaceThemeDto
{
    public Guid Id { get; set; }
    public Guid WorkspaceId { get; set; }
    public string Theme { get; set; } = "system";
    public string? PrimaryColor { get; set; }
    public string? TextColor { get; set; }
    public string? BackgroundColor { get; set; }
    public string? SidebarColor { get; set; }
    public string? AccentColor { get; set; }
}
