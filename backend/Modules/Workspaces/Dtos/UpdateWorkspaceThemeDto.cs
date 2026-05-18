namespace TaskManager.Api.Modules.Workspaces.Dtos;

public class UpdateWorkspaceThemeDto
{
    public string? Theme { get; set; }
    public string? PrimaryColor { get; set; }
    public string? TextColor { get; set; }
    public string? BackgroundColor { get; set; }
    public string? SidebarColor { get; set; }
    public string? AccentColor { get; set; }
}
