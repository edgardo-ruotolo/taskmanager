namespace TaskManager.Api.Modules.Webhooks.Dtos;

public class WebhookLogDto
{
    public Guid Id { get; set; }
    public string Event { get; set; } = "";
    public int StatusCode { get; set; }
    public bool Success { get; set; }
    public DateTime SentAt { get; set; }
    public Guid WebhookId { get; set; }
}
