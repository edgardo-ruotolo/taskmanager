using TaskManager.Api.Common.Auditing;
using TaskManager.Api.Modules.Auth.Entities;

namespace TaskManager.Api.Modules.Workspaces.Entities;

public class Workspace : AuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? LogoUrl { get; set; }
    public Guid OwnerId { get; set; }
    public User Owner { get; set; } = null!;
    public ICollection<WorkspaceMember> Members { get; set; } = [];
}
