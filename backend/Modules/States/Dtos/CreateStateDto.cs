using TaskManager.Api.Modules.States.Entities;

namespace TaskManager.Api.Modules.States.Dtos;

public class CreateStateDto
{
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public StateCategory Category { get; set; }
    public bool IsDefault { get; set; }
    public Guid StateGroupId { get; set; }
}
