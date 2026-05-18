namespace TaskManager.Api.Modules.Integrations.Dtos;

public class WorkspaceIntegrationDto
{
    public Guid Id { get; set; }
    public Guid WorkspaceId { get; set; }
    public string Provider { get; set; } = string.Empty;
    public bool IsConnected { get; set; }
    public string? ExternalAccountId { get; set; }
    public string? ExternalAccountName { get; set; }
    public string? WebhookUrl { get; set; }
    public string? Metadata { get; set; }
    public DateTime? ConnectedAt { get; set; }
}
