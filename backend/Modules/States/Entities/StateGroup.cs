using TaskManager.Api.Common.Auditing;

namespace TaskManager.Api.Modules.States.Entities;

public class StateGroup : AuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsDefault { get; set; }
    public ICollection<State> States { get; set; } = [];
}
