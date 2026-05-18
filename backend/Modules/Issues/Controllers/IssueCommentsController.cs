using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskManager.Api.Modules.Issues.Dtos;
using TaskManager.Api.Modules.Issues.Services;

namespace TaskManager.Api.Modules.Issues.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/companies/{companyId:guid}/issues/{issueId:guid}/comments")]
public class IssueCommentsController(IIssueCommentService commentService) : ControllerBase
{
    private Guid CurrentUserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<List<IssueCommentDto>>> GetComments(
        string workspaceSlug, Guid companyId, Guid issueId, CancellationToken ct)
    {
        var comments = await commentService.GetCommentsAsync(issueId, ct);
        return Ok(comments);
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<IssueCommentDto>> CreateComment(
        string workspaceSlug, Guid companyId, Guid issueId,
        [FromBody] CreateCommentDto dto, CancellationToken ct)
    {
        var comment = await commentService.CreateCommentAsync(issueId, CurrentUserId, dto, ct);
        return CreatedAtAction(nameof(GetComments), new { workspaceSlug, companyId, issueId }, comment);
    }

    [HttpDelete("{commentId:guid}")]
    [Authorize]
    public async Task<IActionResult> DeleteComment(
        string workspaceSlug, Guid companyId, Guid issueId, Guid commentId, CancellationToken ct)
    {
        await commentService.DeleteCommentAsync(commentId, CurrentUserId, ct);
        return NoContent();
    }
}
