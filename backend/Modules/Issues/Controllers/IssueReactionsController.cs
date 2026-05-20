using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Api.Common.Auth;
using TaskManager.Api.Common.Authorization;
using TaskManager.Api.Modules.Issues.Dtos;
using TaskManager.Api.Modules.Issues.Services;

namespace TaskManager.Api.Modules.Issues.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/companies/{companyId:guid}/issues/{issueId:guid}/reactions")]
[Authorize]
[ServiceFilter(typeof(RequireCompanyMemberAttribute))]
public class IssueReactionsController(IIssueReactionService reactionService, ICurrentUser currentUser) : ControllerBase
{

    [HttpGet]
    public async Task<ActionResult<List<IssueReactionDto>>> GetReactions(
        string workspaceSlug, Guid companyId, Guid issueId, CancellationToken ct)
    {
        var reactions = await reactionService.GetReactionsAsync(issueId, ct);
        return Ok(reactions);
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<IssueReactionDto>> AddReaction(
        string workspaceSlug, Guid companyId, Guid issueId,
        [FromBody] CreateReactionDto dto, CancellationToken ct)
    {
        var reaction = await reactionService.AddReactionAsync(issueId, currentUser.UserId, dto, ct);
        return CreatedAtAction(nameof(GetReactions), new { workspaceSlug, companyId, issueId }, reaction);
    }

    [HttpDelete("{emoji}")]
    [Authorize]
    public async Task<IActionResult> RemoveReaction(
        string workspaceSlug, Guid companyId, Guid issueId, string emoji, CancellationToken ct)
    {
        await reactionService.RemoveReactionAsync(issueId, currentUser.UserId, emoji, ct);
        return NoContent();
    }
}
