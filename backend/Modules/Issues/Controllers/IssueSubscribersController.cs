using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Api.Common.Auth;
using TaskManager.Api.Common.Authorization;
using TaskManager.Api.Modules.Issues.Dtos;
using TaskManager.Api.Modules.Issues.Services;

namespace TaskManager.Api.Modules.Issues.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/projects/{projectId:guid}/issues/{issueId:guid}/subscribers")]
[Authorize]
[ServiceFilter(typeof(RequireProjectMemberAttribute))]
public class IssueSubscribersController(IIssueSubscriberService subscriberService, ICurrentUser currentUser) : ControllerBase
{

    [HttpGet]
    public async Task<ActionResult<List<IssueSubscriberDto>>> GetAll(
        string workspaceSlug, Guid projectId, Guid issueId, CancellationToken ct)
    {
        var result = await subscriberService.GetSubscribersAsync(workspaceSlug, projectId, issueId, ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Subscribe(
        string workspaceSlug, Guid projectId, Guid issueId, CancellationToken ct)
    {
        await subscriberService.SubscribeAsync(workspaceSlug, projectId, issueId, currentUser.UserId, ct);
        return NoContent();
    }

    [HttpDelete]
    public async Task<IActionResult> Unsubscribe(
        string workspaceSlug, Guid projectId, Guid issueId, CancellationToken ct)
    {
        await subscriberService.UnsubscribeAsync(workspaceSlug, projectId, issueId, currentUser.UserId, ct);
        return NoContent();
    }
}
