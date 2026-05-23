using TaskManager.Api.Modules.Modules.Entities;

namespace TaskManager.Api.Modules.Modules.Dtos;

public class UpdateModuleDto
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public ModuleStatus? Status { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}
