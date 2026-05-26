namespace TaskManager.Api.Modules.Projects.Dtos;

public class ProjectDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Identifier { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? LogoUrl { get; set; }
    public Guid WorkspaceId { get; set; }
    public Guid OwnerId { get; set; }
    public Guid StateGroupId { get; set; }
    public string StateGroupName { get; set; } = string.Empty;
    public Guid? TeamId { get; set; }
    public string? TeamName { get; set; }
    public bool IsArchived { get; set; }
    public DateTime? ClosingDate { get; set; }
    public bool CyclesEnabled { get; set; }
    public bool ModulesEnabled { get; set; }
    public bool IntakeEnabled { get; set; }
    public bool ArchivesEnabled { get; set; }
    public int TotalIssues { get; set; }
    public int CompletedIssues { get; set; }
    public List<ProjectMemberSummaryDto> Members { get; set; } = [];
    public DateTime CreatedAt { get; set; }
}
