using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Stickies.Dtos;
using TaskManager.Api.Modules.Stickies.Entities;

namespace TaskManager.Api.Modules.Stickies.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/stickies")]
[Authorize]
public class StickiesController(AppDbContext db) : ControllerBase
{
    private Guid CurrentUserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // GET api/workspaces/{workspaceSlug}/stickies
    [HttpGet]
    public async Task<ActionResult<List<StickyDto>>> List(
        string workspaceSlug,
        CancellationToken ct = default)
    {
        var workspace = await ResolveWorkspaceAsync(workspaceSlug, ct);
        if (workspace is null) return NotFound("Workspace not found.");

        var userId = CurrentUserId;

        var stickies = await db.Stickies
            .Where(s => s.WorkspaceId == workspace.Id && s.OwnedById == userId)
            .OrderBy(s => s.SortOrder)
            .ToListAsync(ct);

        return Ok(stickies.Select(MapToDto).ToList());
    }

    // POST api/workspaces/{workspaceSlug}/stickies
    [HttpPost]
    public async Task<ActionResult<StickyDto>> Create(
        string workspaceSlug,
        [FromBody] CreateStickyDto dto,
        CancellationToken ct = default)
    {
        var workspace = await ResolveWorkspaceAsync(workspaceSlug, ct);
        if (workspace is null) return NotFound("Workspace not found.");

        var userId = CurrentUserId;

        var maxSortOrder = await db.Stickies
            .Where(s => s.WorkspaceId == workspace.Id && s.OwnedById == userId)
            .Select(s => (int?)s.SortOrder)
            .MaxAsync(ct) ?? -1;

        var sticky = new Sticky
        {
            WorkspaceId = workspace.Id,
            OwnedById = userId,
            Title = dto.Title,
            Description = dto.Description,
            Color = dto.Color,
            SortOrder = maxSortOrder + 1
        };

        db.Stickies.Add(sticky);
        await db.SaveChangesAsync(ct);

        return CreatedAtAction(nameof(GetById), new { workspaceSlug, id = sticky.Id }, MapToDto(sticky));
    }

    // GET api/workspaces/{workspaceSlug}/stickies/{id}
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<StickyDto>> GetById(
        string workspaceSlug,
        Guid id,
        CancellationToken ct = default)
    {
        var workspace = await ResolveWorkspaceAsync(workspaceSlug, ct);
        if (workspace is null) return NotFound("Workspace not found.");

        var userId = CurrentUserId;

        var sticky = await db.Stickies
            .FirstOrDefaultAsync(
                s => s.Id == id && s.WorkspaceId == workspace.Id && s.OwnedById == userId,
                ct);

        if (sticky is null) return NotFound("Sticky not found.");

        return Ok(MapToDto(sticky));
    }

    // PATCH api/workspaces/{workspaceSlug}/stickies/{id}
    [HttpPatch("{id:guid}")]
    public async Task<ActionResult<StickyDto>> Update(
        string workspaceSlug,
        Guid id,
        [FromBody] UpdateStickyDto dto,
        CancellationToken ct = default)
    {
        var workspace = await ResolveWorkspaceAsync(workspaceSlug, ct);
        if (workspace is null) return NotFound("Workspace not found.");

        var userId = CurrentUserId;

        var sticky = await db.Stickies
            .FirstOrDefaultAsync(
                s => s.Id == id && s.WorkspaceId == workspace.Id && s.OwnedById == userId,
                ct);

        if (sticky is null) return NotFound("Sticky not found.");

        if (dto.Title is not null)
            sticky.Title = dto.Title;

        if (dto.Description is not null)
            sticky.Description = dto.Description;

        if (dto.Color is not null)
            sticky.Color = dto.Color;

        await db.SaveChangesAsync(ct);

        return Ok(MapToDto(sticky));
    }

    // DELETE api/workspaces/{workspaceSlug}/stickies/{id}
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(
        string workspaceSlug,
        Guid id,
        CancellationToken ct = default)
    {
        var workspace = await ResolveWorkspaceAsync(workspaceSlug, ct);
        if (workspace is null) return NotFound("Workspace not found.");

        var userId = CurrentUserId;

        var sticky = await db.Stickies
            .FirstOrDefaultAsync(
                s => s.Id == id && s.WorkspaceId == workspace.Id && s.OwnedById == userId,
                ct);

        if (sticky is null) return NotFound("Sticky not found.");

        sticky.IsDeleted = true;
        sticky.DeletedAt = DateTime.UtcNow;

        await db.SaveChangesAsync(ct);

        return NoContent();
    }

    // POST api/workspaces/{workspaceSlug}/stickies/reorder
    [HttpPost("reorder")]
    public async Task<IActionResult> Reorder(
        string workspaceSlug,
        [FromBody] ReorderStickiesDto dto,
        CancellationToken ct = default)
    {
        var workspace = await ResolveWorkspaceAsync(workspaceSlug, ct);
        if (workspace is null) return NotFound("Workspace not found.");

        var userId = CurrentUserId;

        var stickies = await db.Stickies
            .Where(s => s.WorkspaceId == workspace.Id && s.OwnedById == userId)
            .ToListAsync(ct);

        for (var i = 0; i < dto.OrderedIds.Count; i++)
        {
            var sticky = stickies.FirstOrDefault(s => s.Id == dto.OrderedIds[i]);
            if (sticky is not null)
                sticky.SortOrder = i;
        }

        await db.SaveChangesAsync(ct);

        return NoContent();
    }

    // --- Private helpers ---

    private async Task<Workspaces.Entities.Workspace?> ResolveWorkspaceAsync(string slug, CancellationToken ct)
    {
        var userId = CurrentUserId;

        return await db.Workspaces
            .Include(w => w.Members)
            .FirstOrDefaultAsync(
                w => w.Slug == slug && w.Members.Any(m => m.UserId == userId && !m.IsDeleted),
                ct);
    }

    private static StickyDto MapToDto(Sticky sticky) => new()
    {
        Id = sticky.Id,
        WorkspaceId = sticky.WorkspaceId,
        OwnedById = sticky.OwnedById,
        Title = sticky.Title,
        Description = sticky.Description,
        Color = sticky.Color,
        SortOrder = sticky.SortOrder,
        CreatedAt = sticky.CreatedAt,
        UpdatedAt = sticky.UpdatedAt
    };
}
