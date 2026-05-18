using TaskManager.Api.Modules.Estimates.Entities;

namespace TaskManager.Api.Modules.Estimates.Dtos;

public class EstimateDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public EstimateType Type { get; set; }
    public Guid CompanyId { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<EstimatePointDto> Points { get; set; } = [];
}
