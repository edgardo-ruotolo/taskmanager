using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Api.Common.Authorization;
using TaskManager.Api.Modules.Issues.Dtos;
using TaskManager.Api.Modules.Issues.Services;

namespace TaskManager.Api.Modules.Issues.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/projects/{projectId:guid}/issues/{issueId:guid}/activities")]
[Authorize]
[ServiceFilter(typeof(RequireProjectMemberAttribute))]
public class IssueActivitiesController(IIssueActivityService activityService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<IssueActivityDto>>> GetActivities(
        string workspaceSlug, Guid projectId, Guid issueId, CancellationToken ct)
    {
        var activities = await activityService.GetActivitiesAsync(issueId, ct);
        return Ok(activities);
    }
}
