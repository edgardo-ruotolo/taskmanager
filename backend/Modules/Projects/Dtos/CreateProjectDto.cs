namespace TaskManager.Api.Modules.Projects.Dtos;

public class CreateProjectDto
{
    public string Name { get; set; } = string.Empty;
    public string Identifier { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? TeamId { get; set; }
}
