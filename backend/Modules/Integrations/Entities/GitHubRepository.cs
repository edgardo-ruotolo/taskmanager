using TaskManager.Api.Common.Auditing;
using TaskManager.Api.Modules.Companies.Entities;
using TaskManager.Api.Modules.Workspaces.Entities;

namespace TaskManager.Api.Modules.Integrations.Entities;

public class GitHubRepository : AuditableEntity
{
    public Guid WorkspaceId { get; set; }
    public Guid? CompanyId { get; set; }
    public string RepoOwner { get; set; } = string.Empty;
    public string RepoName { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public bool SyncIssues { get; set; }
    public bool SyncPRs { get; set; }

    public Workspace Workspace { get; set; } = null!;
    public Company? Company { get; set; }
}
