using TaskManager.Api.Common.Auditing;

namespace TaskManager.Api.Modules.Modules.Entities;

public class ModuleLink : AuditableEntity
{
    public string Title { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public Guid ModuleId { get; set; }
    public Module Module { get; set; } = null!;
    public Guid CreatedById { get; set; }
}
