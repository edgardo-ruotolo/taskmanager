namespace TaskManager.Api.Modules.Estimates.Entities;

public class EstimatePoint
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int SortOrder { get; set; }
    public Guid EstimateId { get; set; }
    public Estimate Estimate { get; set; } = null!;
}
