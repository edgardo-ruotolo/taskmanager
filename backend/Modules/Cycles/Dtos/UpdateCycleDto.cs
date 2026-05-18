using TaskManager.Api.Modules.Cycles.Entities;

namespace TaskManager.Api.Modules.Cycles.Dtos;

public class UpdateCycleDto
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public CycleStatus? Status { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}
