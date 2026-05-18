using TaskManager.Api.Modules.ProjectModules.Entities;

namespace TaskManager.Api.Modules.ProjectModules.Dtos;

public class UpdateProjectModuleDto
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public ModuleStatus? Status { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}
