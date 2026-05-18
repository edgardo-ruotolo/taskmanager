using TaskManager.Api.Common.Auditing;
using TaskManager.Api.Modules.Auth.Entities;
using TaskManager.Api.Modules.Companies.Entities;
using TaskManager.Api.Modules.Workspaces.Entities;

namespace TaskManager.Api.Modules.Issues.Entities;

public class IssueView : AuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid WorkspaceId { get; set; }
    public Workspace Workspace { get; set; } = null!;
    public Guid? CompanyId { get; set; }
    public Company? Company { get; set; }
    public Guid OwnerId { get; set; }
    public User Owner { get; set; } = null!;
    public bool IsPublic { get; set; } = false;
    public string FiltersJson { get; set; } = "{}";
    public string DisplayPropertiesJson { get; set; } = "{}";
    public string Layout { get; set; } = "list";
}
