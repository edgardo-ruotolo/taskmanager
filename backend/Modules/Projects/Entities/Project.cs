using TaskManager.Api.Common.Auditing;
using TaskManager.Api.Modules.Auth.Entities;
using TaskManager.Api.Modules.States.Entities;
using TaskManager.Api.Modules.Teams.Entities;
using TaskManager.Api.Modules.Workspaces.Entities;

namespace TaskManager.Api.Modules.Projects.Entities;

public class Project : AuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public string Identifier { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? LogoUrl { get; set; }
    public Guid WorkspaceId { get; set; }
    public Workspace Workspace { get; set; } = null!;
    public Guid OwnerId { get; set; }
    public User Owner { get; set; } = null!;
    public ICollection<ProjectMember> Members { get; set; } = [];
    public Guid StateGroupId { get; set; }
    public StateGroup StateGroup { get; set; } = null!;
    public Guid? TeamId { get; set; }
    public Team? Team { get; set; }
    public bool IsArchived { get; set; }
    public DateTime? ClosingDate { get; set; }
    public bool CyclesEnabled { get; set; } = false;
    public bool ModulesEnabled { get; set; } = false;
    public bool IntakeEnabled { get; set; } = false;
    public bool ArchivesEnabled { get; set; } = false;
}
