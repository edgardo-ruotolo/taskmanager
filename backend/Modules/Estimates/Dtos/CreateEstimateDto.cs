using TaskManager.Api.Modules.Estimates.Entities;

namespace TaskManager.Api.Modules.Estimates.Dtos;

public class CreateEstimateDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public EstimateType Type { get; set; } = EstimateType.Points;
}
