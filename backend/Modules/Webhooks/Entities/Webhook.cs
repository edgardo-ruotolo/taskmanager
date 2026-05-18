using TaskManager.Api.Common.Auditing;
using TaskManager.Api.Modules.Auth.Entities;
using TaskManager.Api.Modules.Workspaces.Entities;

namespace TaskManager.Api.Modules.Webhooks.Entities;

public class Webhook : AuditableEntity
{
    public string Name { get; set; } = "";
    public string Url { get; set; } = "";
    public string Secret { get; set; } = "";
    public bool IsActive { get; set; } = true;
    public string EventsJson { get; set; } = "[]";
    public Guid WorkspaceId { get; set; }
    public Workspace Workspace { get; set; } = null!;
    public Guid CreatedById { get; set; }
    public User CreatedBy { get; set; } = null!;
    public ICollection<WebhookLog> Logs { get; set; } = [];
}
