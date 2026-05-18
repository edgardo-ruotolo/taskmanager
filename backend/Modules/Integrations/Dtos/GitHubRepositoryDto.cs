namespace TaskManager.Api.Modules.Integrations.Dtos;

public class GitHubRepositoryDto
{
    public Guid Id { get; set; }
    public Guid WorkspaceId { get; set; }
    public Guid? CompanyId { get; set; }
    public string RepoOwner { get; set; } = string.Empty;
    public string RepoName { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public bool SyncIssues { get; set; }
    public bool SyncPRs { get; set; }
}
