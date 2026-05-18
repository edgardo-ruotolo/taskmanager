using TaskManager.Api.Common.Auditing;
using TaskManager.Api.Modules.Auth.Entities;
using TaskManager.Api.Modules.States.Entities;
using TaskManager.Api.Modules.Workspaces.Entities;

namespace TaskManager.Api.Modules.Companies.Entities;

public class Company : AuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public string Identifier { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? LogoUrl { get; set; }
    public Guid WorkspaceId { get; set; }
    public Workspace Workspace { get; set; } = null!;
    public Guid OwnerId { get; set; }
    public User Owner { get; set; } = null!;
    public ICollection<CompanyMember> Members { get; set; } = [];
    public Guid StateGroupId { get; set; }
    public StateGroup StateGroup { get; set; } = null!;
}
