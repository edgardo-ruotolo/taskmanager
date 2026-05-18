using TaskManager.Api.Modules.ProjectModules.Entities;

namespace TaskManager.Api.Modules.ProjectModules.Dtos;

public class ProjectModuleDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public ModuleStatus Status { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public Guid CompanyId { get; set; }
    public Guid OwnerId { get; set; }
    public int IssueCount { get; set; }
    public bool IsArchived { get; set; }
    public DateTime? ArchivedAt { get; set; }
    public DateTime CreatedAt { get; set; }
}
