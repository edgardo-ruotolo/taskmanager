using TaskManager.Api.Common.Auditing;
using TaskManager.Api.Modules.Companies.Entities;

namespace TaskManager.Api.Modules.Estimates.Entities;

public enum EstimateType { Points, Categories, Time }

public class Estimate : AuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public EstimateType Type { get; set; } = EstimateType.Points;
    public Guid CompanyId { get; set; }
    public Company Company { get; set; } = null!;
    public ICollection<EstimatePoint> Points { get; set; } = [];
}
