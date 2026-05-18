using TaskManager.Api.Common.Auditing;
using TaskManager.Api.Modules.Companies.Entities;
using TaskManager.Api.Modules.Workspaces.Entities;

namespace TaskManager.Api.Modules.Space.Entities;

public class DeployBoard : AuditableEntity
{
    public Guid CompanyId { get; set; }
    public Company Company { get; set; } = null!;
    public Guid WorkspaceId { get; set; }
    public Workspace Workspace { get; set; } = null!;
    public string Token { get; set; } = Guid.NewGuid().ToString("N");
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsPublic { get; set; } = true;
    public bool ShowVoting { get; set; } = false;
    public bool ShowComments { get; set; } = false;
    public bool ShowPriority { get; set; } = true;
    public bool ShowState { get; set; } = true;
    public bool ShowAssignees { get; set; } = true;
}
