namespace TaskManager.Api.Modules.States.Dtos;

public class StateGroupDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsDefault { get; set; }
    public List<StateDto> States { get; set; } = [];
}
