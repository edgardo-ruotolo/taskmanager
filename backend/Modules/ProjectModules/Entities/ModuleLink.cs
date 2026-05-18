using TaskManager.Api.Common.Auditing;

namespace TaskManager.Api.Modules.ProjectModules.Entities;

public class ModuleLink : AuditableEntity
{
    public string Title { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public Guid ModuleId { get; set; }
    public ProjectModule Module { get; set; } = null!;
    public Guid CreatedById { get; set; }
}
