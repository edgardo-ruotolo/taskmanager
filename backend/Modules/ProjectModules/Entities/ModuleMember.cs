using TaskManager.Api.Common.Auditing;
using TaskManager.Api.Modules.Auth.Entities;

namespace TaskManager.Api.Modules.ProjectModules.Entities;

public class ModuleMember : AuditableEntity
{
    public Guid ModuleId { get; set; }
    public ProjectModule Module { get; set; } = null!;
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
}
