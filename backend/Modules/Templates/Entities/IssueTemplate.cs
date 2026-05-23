using TaskManager.Api.Common.Auditing;
using TaskManager.Api.Modules.Workspaces.Entities;

namespace TaskManager.Api.Modules.Templates.Entities;

public class IssueTemplate : AuditableEntity
{
    public string Name { get; set; } = "";
    public string? Description { get; set; }
    public Guid WorkspaceId { get; set; }
    public Workspace Workspace { get; set; } = null!;
    public Guid? ProjectId { get; set; }
    public string? TemplateJson { get; set; }
}
