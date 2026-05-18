using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskManager.Api.Common.Pagination;
using TaskManager.Api.Modules.Workspaces.Dtos;
using TaskManager.Api.Modules.Workspaces.Services;

namespace TaskManager.Api.Modules.Workspaces.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/activity")]
[Authorize]
public class WorkspaceActivityController(
    IWorkspaceActivityService activityService,
    IWorkspaceService workspaceService) : ControllerBase
{
    private Guid CurrentUserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<PagedResult<WorkspaceActivityDto>>> GetAll(
        string workspaceSlug,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var result = await activityService.GetAllAsync(workspaceSlug, page, pageSize, ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Log(
        string workspaceSlug,
        [FromBody] LogWorkspaceActivityDto dto,
        CancellationToken ct)
    {
        var workspace = await workspaceService.GetBySlugAsync(workspaceSlug, ct);
        await activityService.LogAsync(workspace.Id, CurrentUserId, dto.Action, dto.EntityType, dto.EntityId, dto.EntityTitle, ct);
        return NoContent();
    }
}
