using TaskManager.Api.Common.Auditing;

namespace TaskManager.Api.Modules.States.Entities;

public enum StateCategory
{
    Backlog,
    Unstarted,
    Started,
    Completed,
    Cancelled
}

public class State : AuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public StateCategory Category { get; set; }
    public float Sequence { get; set; }
    public bool IsDefault { get; set; }
    public Guid StateGroupId { get; set; }
    public StateGroup StateGroup { get; set; } = null!;
}
