namespace TaskManager.Api.Modules.Modules.Dtos;

public class CreateModuleDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}
