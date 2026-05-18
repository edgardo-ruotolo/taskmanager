using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskManager.Api.Modules.Issues.Dtos;
using TaskManager.Api.Modules.Issues.Services;

namespace TaskManager.Api.Modules.Issues.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/companies/{companyId:guid}/issues/{issueId:guid}/subscribers")]
[Authorize]
public class IssueSubscribersController(IIssueSubscriberService subscriberService) : ControllerBase
{
    private Guid CurrentUserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<List<IssueSubscriberDto>>> GetAll(
        string workspaceSlug, Guid companyId, Guid issueId, CancellationToken ct)
    {
        var result = await subscriberService.GetSubscribersAsync(workspaceSlug, companyId, issueId, ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Subscribe(
        string workspaceSlug, Guid companyId, Guid issueId, CancellationToken ct)
    {
        await subscriberService.SubscribeAsync(workspaceSlug, companyId, issueId, CurrentUserId, ct);
        return NoContent();
    }

    [HttpDelete]
    public async Task<IActionResult> Unsubscribe(
        string workspaceSlug, Guid companyId, Guid issueId, CancellationToken ct)
    {
        await subscriberService.UnsubscribeAsync(workspaceSlug, companyId, issueId, CurrentUserId, ct);
        return NoContent();
    }
}
