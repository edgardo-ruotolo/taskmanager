using TaskManager.Api.Common.Auditing;
using TaskManager.Api.Modules.Auth.Entities;

namespace TaskManager.Api.Modules.Pages.Entities;

public enum PageAccessRole { Viewer, Editor }

public class PageAccess : AuditableEntity
{
    public Guid PageId { get; set; }
    public Page Page { get; set; } = null!;
    public Guid MemberId { get; set; }
    public User Member { get; set; } = null!;
    public PageAccessRole Role { get; set; } = PageAccessRole.Viewer;
}
