using TaskManager.Api.Common.Auditing;
using TaskManager.Api.Modules.Auth.Entities;

namespace TaskManager.Api.Modules.Modules.Entities;

public class ModuleMember : AuditableEntity
{
    public Guid ModuleId { get; set; }
    public Module Module { get; set; } = null!;
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
}
