namespace TaskManager.Api.Modules.States.Dtos;

public class UpdateStateDto
{
    public string? Name { get; set; }
    public string? Color { get; set; }
    public string? Category { get; set; }
    public float? Sequence { get; set; }
}
