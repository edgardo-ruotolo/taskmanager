using TaskManager.Api.Modules.Estimates.Entities;

namespace TaskManager.Api.Modules.Estimates.Dtos;

public class UpdateEstimateDto
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public EstimateType? Type { get; set; }
}
