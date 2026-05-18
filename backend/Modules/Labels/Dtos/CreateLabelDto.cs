namespace TaskManager.Api.Modules.Labels.Dtos;

public class CreateLabelDto
{
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public string? Description { get; set; }
}
