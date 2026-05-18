using TaskManager.Api.Common.Auditing;

namespace TaskManager.Api.Modules.Workspaces.Entities;

public class WorkspaceTheme : AuditableEntity
{
    public Guid WorkspaceId { get; set; }
    public Workspace Workspace { get; set; } = null!;
    public string Theme { get; set; } = "system"; // light | dark | system
    public string? PrimaryColor { get; set; }   // hex string e.g. "#6366f1"
    public string? TextColor { get; set; }
    public string? BackgroundColor { get; set; }
    public string? SidebarColor { get; set; }
    public string? AccentColor { get; set; }
}
