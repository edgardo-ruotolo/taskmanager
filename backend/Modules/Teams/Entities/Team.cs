using TaskManager.Api.Common.Auditing;
using TaskManager.Api.Modules.Auth.Entities;
using TaskManager.Api.Modules.Workspaces.Entities;

namespace TaskManager.Api.Modules.Teams.Entities;

public class Team : AuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Identifier { get; set; }
    public string? LogoUrl { get; set; }
    public Guid WorkspaceId { get; set; }
    public Workspace Workspace { get; set; } = null!;
    public Guid CreatedById { get; set; }
    public User CreatedBy { get; set; } = null!;
    public ICollection<TeamMember> Members { get; set; } = [];
}
