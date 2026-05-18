using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Integrations.Dtos;
using TaskManager.Api.Modules.Integrations.Entities;

namespace TaskManager.Api.Modules.Integrations.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/integrations/slack")]
[Authorize]
public class SlackIntegrationController(AppDbContext db) : ControllerBase
{
    [HttpGet("status")]
    public async Task<ActionResult> GetStatus(string workspaceSlug, CancellationToken ct)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct);
        if (workspace is null) return NotFound();

        var integration = await db.WorkspaceIntegrations
            .FirstOrDefaultAsync(i => i.WorkspaceId == workspace.Id && i.Provider == "slack", ct);

        return Ok(new
        {
            isConnected = integration?.IsConnected ?? false,
            teamName = integration?.ExternalAccountName,
            channel = (string?)null
        });
    }

    [HttpPost("connect")]
    public ActionResult Connect(string workspaceSlug, [FromBody] ConnectIntegrationDto dto)
    {
        return Ok(new { success = false, message = "OAuth no configurado en este entorno." });
    }

    [HttpDelete("disconnect")]
    public async Task<ActionResult> Disconnect(string workspaceSlug, CancellationToken ct)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct);
        if (workspace is null) return NotFound();

        var integration = await db.WorkspaceIntegrations
            .FirstOrDefaultAsync(i => i.WorkspaceId == workspace.Id && i.Provider == "slack", ct);

        if (integration is not null)
        {
            integration.IsConnected = false;
            integration.IsDeleted = true;
            integration.DeletedAt = DateTime.UtcNow;
            await db.SaveChangesAsync(ct);
        }

        return NoContent();
    }

    [HttpPost("test-message")]
    public ActionResult TestMessage(string workspaceSlug)
    {
        return Ok(new { sent = false, message = "Slack no configurado en este entorno." });
    }
}
