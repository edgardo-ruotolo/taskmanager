using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Api.Common.Auth;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Files.Dtos;
using TaskManager.Api.Modules.Files.Services;
using TaskManager.Api.Modules.Workspaces.Entities;

namespace TaskManager.Api.Modules.Files.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/files")]
[Authorize]
public class FileAssetsController(IFileAssetService fileAssetService, AppDbContext db, ICurrentUser currentUser) : ControllerBase
{

    [HttpGet]
    public async Task<ActionResult<List<FileAssetDto>>> GetAssets(
        string workspaceSlug,
        [FromQuery] string? entityType = null,
        [FromQuery] string? entityId = null,
        CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct);
        if (workspace is null) return NotFound();

        var assets = await fileAssetService.GetAssetsAsync(workspace.Id, entityType, entityId, ct);
        return Ok(assets);
    }

    [HttpPost("register")]
    public async Task<ActionResult<FileAssetDto>> RegisterAsset(string workspaceSlug, [FromBody] RegisterFileAssetDto dto, CancellationToken ct)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct);
        if (workspace is null) return NotFound();

        var asset = await fileAssetService.RegisterAssetAsync(
            workspace.Id,
            currentUser.UserId,
            dto.FileName,
            dto.StoragePath,
            dto.ContentType,
            dto.SizeBytes,
            dto.EntityType,
            dto.EntityId,
            ct);

        return CreatedAtAction(nameof(GetAssets), new { workspaceSlug }, asset);
    }

    private static readonly HashSet<string> AllowedUploadMimeTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "application/pdf"
    };

    [HttpPost("upload")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<FileAssetDto>> Upload(
        string workspaceSlug,
        IFormFile file,
        [FromForm] string? entityType = null,
        [FromForm] string? entityId = null,
        CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct);
        if (workspace is null) return NotFound();

        if (file.Length == 0) return BadRequest("File is empty.");
        if (file.Length > 50 * 1024 * 1024) return BadRequest("File too large (max 50 MB).");

        var contentType = file.ContentType?.ToLowerInvariant() ?? string.Empty;
        if (!AllowedUploadMimeTypes.Contains(contentType))
            return BadRequest(new { error = "File type not allowed" });

        var asset = await fileAssetService.UploadAsync(workspace.Id, currentUser.UserId, file, entityType, entityId, ct);
        return CreatedAtAction(nameof(GetAssets), new { workspaceSlug }, asset);
    }

    [HttpDelete("{assetId:guid}")]
    public async Task<IActionResult> DeleteAsset(string workspaceSlug, Guid assetId, CancellationToken ct)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct);
        if (workspace is null) return NotFound();

        var asset = await db.FileAssets.FirstOrDefaultAsync(f => f.Id == assetId && f.WorkspaceId == workspace.Id, ct);
        if (asset is null) return NotFound();

        // Only the uploader or a workspace Admin can delete the asset.
        var isAdmin = await db.WorkspaceMembers.AnyAsync(
            m => m.WorkspaceId == workspace.Id
                 && m.UserId == currentUser.UserId
                 && m.Role == WorkspaceRole.Admin,
            ct);
        if (asset.UploadedById != currentUser.UserId && !isAdmin) return Forbid();

        await fileAssetService.DeleteAssetAsync(assetId, currentUser.UserId, ct);
        return NoContent();
    }
}
