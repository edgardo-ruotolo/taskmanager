using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Files.Dtos;
using TaskManager.Api.Modules.Files.Services;

namespace TaskManager.Api.Modules.Files.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/files")]
[Authorize]
public class FileAssetsController(IFileAssetService fileAssetService, AppDbContext db) : ControllerBase
{
    private Guid CurrentUserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

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
            CurrentUserId,
            dto.FileName,
            dto.StoragePath,
            dto.ContentType,
            dto.SizeBytes,
            dto.EntityType,
            dto.EntityId,
            ct);

        return CreatedAtAction(nameof(GetAssets), new { workspaceSlug }, asset);
    }

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

        var asset = await fileAssetService.UploadAsync(workspace.Id, CurrentUserId, file, entityType, entityId, ct);
        return CreatedAtAction(nameof(GetAssets), new { workspaceSlug }, asset);
    }

    [HttpDelete("{assetId:guid}")]
    public async Task<IActionResult> DeleteAsset(string workspaceSlug, Guid assetId, CancellationToken ct)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct);
        if (workspace is null) return NotFound();

        await fileAssetService.DeleteAssetAsync(assetId, CurrentUserId, ct);
        return NoContent();
    }
}
