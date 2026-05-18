using TaskManager.Api.Common.Auditing;
using TaskManager.Api.Modules.Workspaces.Entities;

namespace TaskManager.Api.Modules.Integrations.Entities;

public class WorkspaceIntegration : AuditableEntity
{
    public Guid WorkspaceId { get; set; }
    public string Provider { get; set; } = string.Empty;
    public bool IsConnected { get; set; }
    public string? ExternalAccountId { get; set; }
    public string? ExternalAccountName { get; set; }
    public string? AccessTokenEncrypted { get; set; }
    public string? WebhookUrl { get; set; }
    public string? Metadata { get; set; }
    public DateTime? ConnectedAt { get; set; }

    public Workspace Workspace { get; set; } = null!;
}
