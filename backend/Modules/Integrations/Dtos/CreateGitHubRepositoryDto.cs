namespace TaskManager.Api.Modules.Integrations.Dtos;

public class CreateGitHubRepositoryDto
{
    public string RepoOwner { get; set; } = string.Empty;
    public string RepoName { get; set; } = string.Empty;
    public Guid? CompanyId { get; set; }
    public bool SyncIssues { get; set; }
    public bool SyncPRs { get; set; }
}
