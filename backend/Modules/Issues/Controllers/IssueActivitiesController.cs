using Microsoft.AspNetCore.Mvc;
using TaskManager.Api.Modules.Issues.Dtos;
using TaskManager.Api.Modules.Issues.Services;

namespace TaskManager.Api.Modules.Issues.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/companies/{companyId:guid}/issues/{issueId:guid}/activities")]
public class IssueActivitiesController(IIssueActivityService activityService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<IssueActivityDto>>> GetActivities(
        string workspaceSlug, Guid companyId, Guid issueId, CancellationToken ct)
    {
        var activities = await activityService.GetActivitiesAsync(issueId, ct);
        return Ok(activities);
    }
}
