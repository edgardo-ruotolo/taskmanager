using TaskManager.Api.Common.Auditing;
using TaskManager.Api.Modules.Auth.Entities;

namespace TaskManager.Api.Modules.Pages.Entities;

public class PageVersion : AuditableEntity
{
    public Guid PageId { get; set; }
    public Page Page { get; set; } = null!;
    public string Description { get; set; } = string.Empty;
    public Guid OwnedById { get; set; }
    public User OwnedBy { get; set; } = null!;
    public int VersionNumber { get; set; }
}
