using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskManager.Api.Modules.Issues.Dtos;
using TaskManager.Api.Modules.Issues.Services;

namespace TaskManager.Api.Modules.Issues.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/companies/{companyId:guid}/issues/{issueId:guid}/reactions")]
public class IssueReactionsController(IIssueReactionService reactionService) : ControllerBase
{
    private Guid CurrentUserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

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
        var reaction = await reactionService.AddReactionAsync(issueId, CurrentUserId, dto, ct);
        return CreatedAtAction(nameof(GetReactions), new { workspaceSlug, companyId, issueId }, reaction);
    }

    [HttpDelete("{emoji}")]
    [Authorize]
    public async Task<IActionResult> RemoveReaction(
        string workspaceSlug, Guid companyId, Guid issueId, string emoji, CancellationToken ct)
    {
        await reactionService.RemoveReactionAsync(issueId, CurrentUserId, emoji, ct);
        return NoContent();
    }
}
