using TaskManager.Api.Common.Auditing;

namespace TaskManager.Api.Modules.Webhooks.Entities;

public class WebhookLog : AuditableEntity
{
    public string Event { get; set; } = "";
    public string Payload { get; set; } = "{}";
    public int StatusCode { get; set; }
    public string? ResponseBody { get; set; }
    public bool Success { get; set; }
    public DateTime SentAt { get; set; } = DateTime.UtcNow;
    public Guid WebhookId { get; set; }
    public Webhook Webhook { get; set; } = null!;
}
