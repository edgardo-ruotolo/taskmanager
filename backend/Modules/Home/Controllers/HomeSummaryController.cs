using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Api.Common.Auth;
using TaskManager.Api.Common.Authorization;
using TaskManager.Api.Modules.Home.Dtos;
using TaskManager.Api.Modules.Home.Services;

namespace TaskManager.Api.Modules.Home.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/home-summary")]
[Authorize]
[ServiceFilter(typeof(RequireWorkspaceMemberAttribute))]
public class HomeSummaryController(IHomeSummaryService homeSummaryService, ICurrentUser currentUser) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<HomeSummaryDto>> GetSummary(
        string workspaceSlug,
        CancellationToken ct = default)
    {
        var result = await homeSummaryService.GetSummaryAsync(workspaceSlug, currentUser.UserId, ct);
        return Ok(result);
    }
}
