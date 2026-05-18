namespace TaskManager.Api.Modules.Webhooks.Dtos;

public class CreateWebhookDto
{
    public string Name { get; set; } = "";
    public string Url { get; set; } = "";
    public string EventsJson { get; set; } = "[]";
}
