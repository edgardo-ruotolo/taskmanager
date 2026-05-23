using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Api.Common.Auth;
using TaskManager.Api.Common.Authorization;
using TaskManager.Api.Modules.Issues.Dtos;
using TaskManager.Api.Modules.Issues.Services;

namespace TaskManager.Api.Modules.Issues.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/projects/{projectId:guid}/issues/{issueId:guid}/comments")]
[Authorize]
[ServiceFilter(typeof(RequireProjectMemberAttribute))]
public class IssueCommentsController(IIssueCommentService commentService, ICurrentUser currentUser) : ControllerBase
{

    [HttpGet]
    public async Task<ActionResult<List<IssueCommentDto>>> GetComments(
        string workspaceSlug, Guid projectId, Guid issueId, CancellationToken ct)
    {
        var comments = await commentService.GetCommentsAsync(issueId, ct);
        return Ok(comments);
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<IssueCommentDto>> CreateComment(
        string workspaceSlug, Guid projectId, Guid issueId,
        [FromBody] CreateCommentDto dto, CancellationToken ct)
    {
        var comment = await commentService.CreateCommentAsync(issueId, currentUser.UserId, dto, ct);
        return CreatedAtAction(nameof(GetComments), new { workspaceSlug, projectId, issueId }, comment);
    }

    [HttpDelete("{commentId:guid}")]
    [Authorize]
    public async Task<IActionResult> DeleteComment(
        string workspaceSlug, Guid projectId, Guid issueId, Guid commentId, CancellationToken ct)
    {
        await commentService.DeleteCommentAsync(commentId, currentUser.UserId, ct);
        return NoContent();
    }
}
