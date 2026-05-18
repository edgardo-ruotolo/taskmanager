using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Webhooks.Dtos;
using TaskManager.Api.Modules.Webhooks.Services;

namespace TaskManager.Api.Modules.Webhooks.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/webhooks")]
[Authorize]
public class WebhooksController(IWebhookService webhookService, AppDbContext db) : ControllerBase
{
    private Guid CurrentUserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<List<WebhookDto>>> GetWebhooks(string workspaceSlug, CancellationToken ct)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct);
        if (workspace is null) return NotFound();

        var webhooks = await webhookService.GetWebhooksAsync(workspace.Id, ct);
        return Ok(webhooks);
    }

    [HttpPost]
    public async Task<ActionResult<WebhookDto>> CreateWebhook(string workspaceSlug, [FromBody] CreateWebhookDto dto, CancellationToken ct)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct);
        if (workspace is null) return NotFound();

        var webhook = await webhookService.CreateWebhookAsync(workspace.Id, CurrentUserId, dto, ct);
        return CreatedAtAction(nameof(GetWebhooks), new { workspaceSlug }, webhook);
    }

    [HttpDelete("{webhookId:guid}")]
    public async Task<IActionResult> DeleteWebhook(string workspaceSlug, Guid webhookId, CancellationToken ct)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct);
        if (workspace is null) return NotFound();

        await webhookService.DeleteWebhookAsync(webhookId, CurrentUserId, ct);
        return NoContent();
    }

    [HttpGet("{webhookId:guid}/logs")]
    public async Task<ActionResult<List<WebhookLogDto>>> GetLogs(string workspaceSlug, Guid webhookId, CancellationToken ct)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct);
        if (workspace is null) return NotFound();

        var logs = await webhookService.GetLogsAsync(webhookId, ct);
        return Ok(logs);
    }
}
