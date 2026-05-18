using System.Security.Cryptography;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Common.Exceptions;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Webhooks.Dtos;
using TaskManager.Api.Modules.Webhooks.Entities;

namespace TaskManager.Api.Modules.Webhooks.Services;

public class WebhookService(AppDbContext db, IMapper mapper) : IWebhookService
{
    public async Task<List<WebhookDto>> GetWebhooksAsync(Guid workspaceId, CancellationToken ct = default)
    {
        var webhooks = await db.Webhooks
            .Where(w => w.WorkspaceId == workspaceId)
            .OrderBy(w => w.Name)
            .ToListAsync(ct);

        return mapper.Map<List<WebhookDto>>(webhooks);
    }

    public async Task<WebhookDto> CreateWebhookAsync(Guid workspaceId, Guid createdById, CreateWebhookDto dto, CancellationToken ct = default)
    {
        var webhook = mapper.Map<Webhook>(dto);
        webhook.WorkspaceId = workspaceId;
        webhook.CreatedById = createdById;
        webhook.Secret = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));

        db.Webhooks.Add(webhook);
        await db.SaveChangesAsync(ct);

        return mapper.Map<WebhookDto>(webhook);
    }

    public async Task DeleteWebhookAsync(Guid webhookId, Guid requesterId, CancellationToken ct = default)
    {
        var webhook = await db.Webhooks.FirstOrDefaultAsync(w => w.Id == webhookId, ct)
            ?? throw new NotFoundException("Webhook not found.");

        webhook.IsDeleted = true;
        webhook.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
    }

    public async Task<List<WebhookLogDto>> GetLogsAsync(Guid webhookId, CancellationToken ct = default)
    {
        var logs = await db.WebhookLogs
            .Where(l => l.WebhookId == webhookId)
            .OrderByDescending(l => l.SentAt)
            .ToListAsync(ct);

        return mapper.Map<List<WebhookLogDto>>(logs);
    }
}
