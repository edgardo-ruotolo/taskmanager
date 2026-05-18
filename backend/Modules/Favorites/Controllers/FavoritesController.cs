using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskManager.Api.Modules.Favorites.Dtos;
using TaskManager.Api.Modules.Favorites.Services;

namespace TaskManager.Api.Modules.Favorites.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/favorites")]
[Authorize]
public class FavoritesController(IFavoriteService favoriteService) : ControllerBase
{
    private Guid CurrentUserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<IEnumerable<FavoriteDto>>> GetAll(string workspaceSlug, CancellationToken ct)
    {
        var favorites = await favoriteService.GetAllAsync(workspaceSlug, CurrentUserId, ct);
        return Ok(favorites);
    }

    [HttpPost]
    public async Task<ActionResult<FavoriteDto>> Create(string workspaceSlug, [FromBody] CreateFavoriteDto dto, CancellationToken ct)
    {
        var favorite = await favoriteService.CreateAsync(workspaceSlug, CurrentUserId, dto, ct);
        return Ok(favorite);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(string workspaceSlug, Guid id, CancellationToken ct)
    {
        await favoriteService.DeleteAsync(id, CurrentUserId, ct);
        return NoContent();
    }
}
