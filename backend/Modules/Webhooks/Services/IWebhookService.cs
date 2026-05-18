using TaskManager.Api.Modules.Webhooks.Dtos;

namespace TaskManager.Api.Modules.Webhooks.Services;

public interface IWebhookService
{
    Task<List<WebhookDto>> GetWebhooksAsync(Guid workspaceId, CancellationToken ct = default);
    Task<WebhookDto> CreateWebhookAsync(Guid workspaceId, Guid createdById, CreateWebhookDto dto, CancellationToken ct = default);
    Task DeleteWebhookAsync(Guid webhookId, Guid requesterId, CancellationToken ct = default);
    Task<List<WebhookLogDto>> GetLogsAsync(Guid webhookId, CancellationToken ct = default);
}
