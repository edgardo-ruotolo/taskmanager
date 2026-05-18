namespace TaskManager.Api.Modules.Webhooks.Dtos;

public class WebhookDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = "";
    public string Url { get; set; } = "";
    public bool IsActive { get; set; }
    public string EventsJson { get; set; } = "[]";
    public Guid WorkspaceId { get; set; }
    public Guid CreatedById { get; set; }
    public DateTime CreatedAt { get; set; }
}
