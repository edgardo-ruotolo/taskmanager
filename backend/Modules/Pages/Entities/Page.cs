using TaskManager.Api.Common.Auditing;
using TaskManager.Api.Modules.Auth.Entities;
using TaskManager.Api.Modules.Workspaces.Entities;

namespace TaskManager.Api.Modules.Pages.Entities;

public class Page : AuditableEntity
{
    public Guid WorkspaceId { get; set; }
    public Workspace Workspace { get; set; } = null!;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty; // HTML content
    public bool IsLocked { get; set; } = false;
    public bool IsArchived { get; set; } = false;
    public Guid OwnedById { get; set; }
    public User OwnedBy { get; set; } = null!;
    public ICollection<PageVersion> Versions { get; set; } = [];
    public ICollection<PageLabel> PageLabels { get; set; } = [];
    public ICollection<PageAccess> Access { get; set; } = [];
}
