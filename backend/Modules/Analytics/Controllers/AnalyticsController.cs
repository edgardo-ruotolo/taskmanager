using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Api.Common.Auth;
using TaskManager.Api.Modules.Analytics.Dtos;
using TaskManager.Api.Modules.Analytics.Services;

namespace TaskManager.Api.Modules.Analytics.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/analytics")]
[Authorize]
public class AnalyticsController(IAnalyticsService analyticsService, ICurrentUser currentUser) : ControllerBase
{
    [HttpGet("overview")]
    public async Task<IActionResult> GetOverview(string workspaceSlug, CancellationToken ct)
        => Ok(await analyticsService.GetOverviewAsync(workspaceSlug, ct));

    [HttpGet("issues-by-state")]
    public async Task<IActionResult> GetIssuesByState(string workspaceSlug, CancellationToken ct)
        => Ok(await analyticsService.GetIssuesByStateAsync(workspaceSlug, ct));

    [HttpGet("issues-by-priority")]
    public async Task<IActionResult> GetIssuesByPriority(string workspaceSlug, CancellationToken ct)
        => Ok(await analyticsService.GetIssuesByPriorityAsync(workspaceSlug, ct));

    [HttpGet("created-vs-resolved")]
    public async Task<IActionResult> GetCreatedVsResolved(string workspaceSlug, CancellationToken ct)
        => Ok(await analyticsService.GetCreatedVsResolvedAsync(workspaceSlug, ct));

    [HttpGet("projects/{projectIdentifier}/overview")]
    public async Task<IActionResult> GetProjectOverview(string workspaceSlug, string projectIdentifier, CancellationToken ct)
        => Ok(await analyticsService.GetProjectOverviewAsync(workspaceSlug, projectIdentifier, ct));

    [HttpGet("projects/{projectIdentifier}/activity")]
    public async Task<IActionResult> GetProjectActivity(string workspaceSlug, string projectIdentifier, CancellationToken ct)
        => Ok(await analyticsService.GetProjectActivityAsync(workspaceSlug, projectIdentifier, ct));

    [HttpGet("views")]
    public async Task<ActionResult<IReadOnlyList<AnalyticViewDto>>> GetViews(string workspaceSlug, CancellationToken ct)
        => Ok(await analyticsService.GetViewsAsync(workspaceSlug, currentUser.UserId, ct));

    [HttpPost("views")]
    public async Task<ActionResult<AnalyticViewDto>> CreateView(
        string workspaceSlug, [FromBody] CreateAnalyticViewDto dto, CancellationToken ct)
    {
        var view = await analyticsService.CreateViewAsync(workspaceSlug, currentUser.UserId, dto, ct);
        return CreatedAtAction(nameof(GetViews), new { workspaceSlug }, view);
    }

    [HttpPatch("views/{viewId:guid}")]
    public async Task<ActionResult<AnalyticViewDto>> UpdateView(
        string workspaceSlug, Guid viewId, [FromBody] UpdateAnalyticViewDto dto, CancellationToken ct)
    {
        var view = await analyticsService.UpdateViewAsync(viewId, currentUser.UserId, dto, ct);
        if (view is null) return NotFound();
        return Ok(view);
    }

    [HttpDelete("views/{viewId:guid}")]
    public async Task<IActionResult> DeleteView(string workspaceSlug, Guid viewId, CancellationToken ct)
    {
        var deleted = await analyticsService.DeleteViewAsync(viewId, currentUser.UserId, ct);
        return deleted ? NoContent() : NotFound();
    }
}
