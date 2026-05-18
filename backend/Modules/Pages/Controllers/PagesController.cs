using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Pages.Dtos;
using TaskManager.Api.Modules.Pages.Entities;

namespace TaskManager.Api.Modules.Pages.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/pages")]
[Authorize]
public class PagesController(AppDbContext db) : ControllerBase
{
    private Guid CurrentUserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // GET api/workspaces/{workspaceSlug}/pages?archived=false
    [HttpGet]
    public async Task<ActionResult<List<PageDto>>> List(
        string workspaceSlug,
        [FromQuery] bool archived = false,
        CancellationToken ct = default)
    {
        var workspace = await ResolveWorkspaceAsync(workspaceSlug, ct);
        if (workspace is null) return NotFound("Workspace not found.");

        var pages = await db.Pages
            .Include(p => p.OwnedBy)
            .Include(p => p.PageLabels)
            .Where(p => p.WorkspaceId == workspace.Id && p.IsArchived == archived)
            .OrderByDescending(p => p.UpdatedAt)
            .ToListAsync(ct);

        return Ok(pages.Select(MapToDto).ToList());
    }

    // POST api/workspaces/{workspaceSlug}/pages
    [HttpPost]
    public async Task<ActionResult<PageDto>> Create(
        string workspaceSlug,
        [FromBody] CreatePageDto dto,
        CancellationToken ct = default)
    {
        var workspace = await ResolveWorkspaceAsync(workspaceSlug, ct);
        if (workspace is null) return NotFound("Workspace not found.");

        var page = new Page
        {
            WorkspaceId = workspace.Id,
            Title = dto.Title,
            Description = dto.Description,
            OwnedById = CurrentUserId
        };

        db.Pages.Add(page);

        if (dto.LabelIds.Count > 0)
        {
            foreach (var labelId in dto.LabelIds)
                db.PageLabels.Add(new PageLabel { PageId = page.Id, LabelId = labelId });
        }

        await db.SaveChangesAsync(ct);

        await db.Entry(page).Reference(p => p.OwnedBy).LoadAsync(ct);
        await db.Entry(page).Collection(p => p.PageLabels).LoadAsync(ct);

        return CreatedAtAction(nameof(GetById), new { workspaceSlug, id = page.Id }, MapToDto(page));
    }

    // GET api/workspaces/{workspaceSlug}/pages/{id}
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<PageDto>> GetById(
        string workspaceSlug,
        Guid id,
        CancellationToken ct = default)
    {
        var workspace = await ResolveWorkspaceAsync(workspaceSlug, ct);
        if (workspace is null) return NotFound("Workspace not found.");

        var page = await db.Pages
            .Include(p => p.OwnedBy)
            .Include(p => p.PageLabels)
            .FirstOrDefaultAsync(p => p.Id == id && p.WorkspaceId == workspace.Id, ct);

        if (page is null) return NotFound("Page not found.");

        return Ok(MapToDto(page));
    }

    // PATCH api/workspaces/{workspaceSlug}/pages/{id}
    [HttpPatch("{id:guid}")]
    public async Task<ActionResult<PageDto>> Update(
        string workspaceSlug,
        Guid id,
        [FromBody] UpdatePageDto dto,
        CancellationToken ct = default)
    {
        var workspace = await ResolveWorkspaceAsync(workspaceSlug, ct);
        if (workspace is null) return NotFound("Workspace not found.");

        var page = await db.Pages
            .Include(p => p.OwnedBy)
            .Include(p => p.PageLabels)
            .Include(p => p.Versions)
            .FirstOrDefaultAsync(p => p.Id == id && p.WorkspaceId == workspace.Id, ct);

        if (page is null) return NotFound("Page not found.");

        if (dto.Description is not null && dto.Description != page.Description)
        {
            var nextVersion = page.Versions.Count > 0
                ? page.Versions.Max(v => v.VersionNumber) + 1
                : 1;

            db.PageVersions.Add(new PageVersion
            {
                PageId = page.Id,
                Description = page.Description,
                OwnedById = CurrentUserId,
                VersionNumber = nextVersion
            });

            page.Description = dto.Description;
        }

        if (dto.Title is not null)
            page.Title = dto.Title;

        if (dto.LabelIds is not null)
        {
            db.PageLabels.RemoveRange(page.PageLabels);
            foreach (var labelId in dto.LabelIds)
                db.PageLabels.Add(new PageLabel { PageId = page.Id, LabelId = labelId });
        }

        await db.SaveChangesAsync(ct);

        await db.Entry(page).Collection(p => p.PageLabels).LoadAsync(ct);

        return Ok(MapToDto(page));
    }

    // DELETE api/workspaces/{workspaceSlug}/pages/{id}
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(
        string workspaceSlug,
        Guid id,
        CancellationToken ct = default)
    {
        var workspace = await ResolveWorkspaceAsync(workspaceSlug, ct);
        if (workspace is null) return NotFound("Workspace not found.");

        var page = await db.Pages
            .FirstOrDefaultAsync(p => p.Id == id && p.WorkspaceId == workspace.Id, ct);

        if (page is null) return NotFound("Page not found.");

        page.IsDeleted = true;
        page.DeletedAt = DateTime.UtcNow;

        await db.SaveChangesAsync(ct);

        return NoContent();
    }

    // POST api/workspaces/{workspaceSlug}/pages/{id}/archive
    [HttpPost("{id:guid}/archive")]
    public async Task<ActionResult<PageDto>> Archive(
        string workspaceSlug,
        Guid id,
        CancellationToken ct = default)
    {
        var page = await FindPageInWorkspaceAsync(workspaceSlug, id, ct);
        if (page is null) return NotFound("Page not found.");

        page.IsArchived = true;
        await db.SaveChangesAsync(ct);

        return Ok(MapToDto(page));
    }

    // POST api/workspaces/{workspaceSlug}/pages/{id}/unarchive
    [HttpPost("{id:guid}/unarchive")]
    public async Task<ActionResult<PageDto>> Unarchive(
        string workspaceSlug,
        Guid id,
        CancellationToken ct = default)
    {
        var page = await FindPageInWorkspaceAsync(workspaceSlug, id, ct);
        if (page is null) return NotFound("Page not found.");

        page.IsArchived = false;
        await db.SaveChangesAsync(ct);

        return Ok(MapToDto(page));
    }

    // POST api/workspaces/{workspaceSlug}/pages/{id}/lock
    [HttpPost("{id:guid}/lock")]
    public async Task<ActionResult<PageDto>> Lock(
        string workspaceSlug,
        Guid id,
        CancellationToken ct = default)
    {
        var page = await FindPageInWorkspaceAsync(workspaceSlug, id, ct);
        if (page is null) return NotFound("Page not found.");

        page.IsLocked = true;
        await db.SaveChangesAsync(ct);

        return Ok(MapToDto(page));
    }

    // POST api/workspaces/{workspaceSlug}/pages/{id}/unlock
    [HttpPost("{id:guid}/unlock")]
    public async Task<ActionResult<PageDto>> Unlock(
        string workspaceSlug,
        Guid id,
        CancellationToken ct = default)
    {
        var page = await FindPageInWorkspaceAsync(workspaceSlug, id, ct);
        if (page is null) return NotFound("Page not found.");

        page.IsLocked = false;
        await db.SaveChangesAsync(ct);

        return Ok(MapToDto(page));
    }

    // POST api/workspaces/{workspaceSlug}/pages/{id}/duplicate
    [HttpPost("{id:guid}/duplicate")]
    public async Task<ActionResult<PageDto>> Duplicate(
        string workspaceSlug,
        Guid id,
        [FromBody] DuplicatePageDto dto,
        CancellationToken ct = default)
    {
        var workspace = await ResolveWorkspaceAsync(workspaceSlug, ct);
        if (workspace is null) return NotFound("Workspace not found.");

        var source = await db.Pages
            .Include(p => p.PageLabels)
            .FirstOrDefaultAsync(p => p.Id == id && p.WorkspaceId == workspace.Id, ct);

        if (source is null) return NotFound("Page not found.");

        var copy = new Page
        {
            WorkspaceId = workspace.Id,
            Title = dto.Title,
            Description = source.Description,
            OwnedById = CurrentUserId
        };

        db.Pages.Add(copy);

        foreach (var pl in source.PageLabels)
            db.PageLabels.Add(new PageLabel { PageId = copy.Id, LabelId = pl.LabelId });

        await db.SaveChangesAsync(ct);

        await db.Entry(copy).Reference(p => p.OwnedBy).LoadAsync(ct);
        await db.Entry(copy).Collection(p => p.PageLabels).LoadAsync(ct);

        return CreatedAtAction(nameof(GetById), new { workspaceSlug, id = copy.Id }, MapToDto(copy));
    }

    // GET api/workspaces/{workspaceSlug}/pages/{id}/versions
    [HttpGet("{id:guid}/versions")]
    public async Task<ActionResult<List<PageVersionDto>>> ListVersions(
        string workspaceSlug,
        Guid id,
        CancellationToken ct = default)
    {
        var workspace = await ResolveWorkspaceAsync(workspaceSlug, ct);
        if (workspace is null) return NotFound("Workspace not found.");

        var pageExists = await db.Pages
            .AnyAsync(p => p.Id == id && p.WorkspaceId == workspace.Id, ct);

        if (!pageExists) return NotFound("Page not found.");

        var versions = await db.PageVersions
            .Where(v => v.PageId == id)
            .OrderByDescending(v => v.VersionNumber)
            .Select(v => new PageVersionDto
            {
                Id = v.Id,
                PageId = v.PageId,
                Description = v.Description,
                OwnedById = v.OwnedById,
                VersionNumber = v.VersionNumber,
                CreatedAt = v.CreatedAt
            })
            .ToListAsync(ct);

        return Ok(versions);
    }

    // POST api/workspaces/{workspaceSlug}/pages/{id}/restore-version/{versionId}
    [HttpPost("{id:guid}/restore-version/{versionId:guid}")]
    public async Task<ActionResult<PageDto>> RestoreVersion(
        string workspaceSlug,
        Guid id,
        Guid versionId,
        CancellationToken ct = default)
    {
        var workspace = await ResolveWorkspaceAsync(workspaceSlug, ct);
        if (workspace is null) return NotFound("Workspace not found.");

        var page = await db.Pages
            .Include(p => p.OwnedBy)
            .Include(p => p.PageLabels)
            .Include(p => p.Versions)
            .FirstOrDefaultAsync(p => p.Id == id && p.WorkspaceId == workspace.Id, ct);

        if (page is null) return NotFound("Page not found.");

        var version = await db.PageVersions
            .FirstOrDefaultAsync(v => v.Id == versionId && v.PageId == id, ct);

        if (version is null) return NotFound("Version not found.");

        // Snapshot current state before restoring
        var nextVersion = page.Versions.Count > 0
            ? page.Versions.Max(v => v.VersionNumber) + 1
            : 1;

        db.PageVersions.Add(new PageVersion
        {
            PageId = page.Id,
            Description = page.Description,
            OwnedById = CurrentUserId,
            VersionNumber = nextVersion
        });

        page.Description = version.Description;

        await db.SaveChangesAsync(ct);

        return Ok(MapToDto(page));
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

    private async Task<Page?> FindPageInWorkspaceAsync(string workspaceSlug, Guid pageId, CancellationToken ct)
    {
        var workspace = await ResolveWorkspaceAsync(workspaceSlug, ct);
        if (workspace is null) return null;

        return await db.Pages
            .Include(p => p.OwnedBy)
            .Include(p => p.PageLabels)
            .FirstOrDefaultAsync(p => p.Id == pageId && p.WorkspaceId == workspace.Id, ct);
    }

    private static PageDto MapToDto(Page page) => new()
    {
        Id = page.Id,
        WorkspaceId = page.WorkspaceId,
        Title = page.Title,
        Description = page.Description,
        IsLocked = page.IsLocked,
        IsArchived = page.IsArchived,
        OwnedById = page.OwnedById,
        OwnedByName = page.OwnedBy is not null
            ? $"{page.OwnedBy.FirstName} {page.OwnedBy.LastName}".Trim()
            : string.Empty,
        CreatedAt = page.CreatedAt,
        UpdatedAt = page.UpdatedAt,
        LabelIds = page.PageLabels.Select(pl => pl.LabelId).ToList()
    };
}
