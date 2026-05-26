namespace TaskManager.Api.Modules.Projects.Dtos;

public class UpdateProjectDto
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? LogoUrl { get; set; }
    public Guid? StateGroupId { get; set; }
    public bool? CyclesEnabled { get; set; }
    public bool? ModulesEnabled { get; set; }
    public bool? IntakeEnabled { get; set; }
    public bool? ArchivesEnabled { get; set; }
}
