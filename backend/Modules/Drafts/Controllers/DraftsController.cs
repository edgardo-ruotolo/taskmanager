using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Api.Common.Auth;
using TaskManager.Api.Modules.Drafts.Dtos;
using TaskManager.Api.Modules.Drafts.Services;

namespace TaskManager.Api.Modules.Drafts.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/drafts")]
[Authorize]
public class DraftsController(IDraftService draftService, ICurrentUser currentUser) : ControllerBase
{

    [HttpGet]
    public async Task<ActionResult<List<DraftIssueDto>>> GetAll(string workspaceSlug, CancellationToken ct)
    {
        var drafts = await draftService.GetAllAsync(workspaceSlug, currentUser.UserId, ct);
        return Ok(drafts);
    }

    [HttpPost]
    public async Task<ActionResult<DraftIssueDto>> Create(
        string workspaceSlug, [FromBody] CreateDraftIssueDto dto, CancellationToken ct)
    {
        var draft = await draftService.CreateAsync(workspaceSlug, currentUser.UserId, dto, ct);
        return CreatedAtAction(nameof(GetById), new { workspaceSlug, draftId = draft.Id }, draft);
    }

    [HttpGet("{draftId:guid}")]
    public async Task<ActionResult<DraftIssueDto>> GetById(string workspaceSlug, Guid draftId, CancellationToken ct)
    {
        var draft = await draftService.GetByIdAsync(workspaceSlug, draftId, currentUser.UserId, ct);
        return Ok(draft);
    }

    [HttpPatch("{draftId:guid}")]
    public async Task<ActionResult<DraftIssueDto>> Update(
        string workspaceSlug, Guid draftId, [FromBody] UpdateDraftIssueDto dto, CancellationToken ct)
    {
        var draft = await draftService.UpdateAsync(workspaceSlug, draftId, currentUser.UserId, dto, ct);
        return Ok(draft);
    }

    [HttpDelete("{draftId:guid}")]
    public async Task<IActionResult> Delete(string workspaceSlug, Guid draftId, CancellationToken ct)
    {
        await draftService.DeleteAsync(workspaceSlug, draftId, currentUser.UserId, ct);
        return NoContent();
    }

    [HttpPost("{draftId:guid}/publish")]
    public async Task<ActionResult<object>> Publish(string workspaceSlug, Guid draftId, CancellationToken ct)
    {
        var issue = await draftService.PublishAsync(workspaceSlug, draftId, currentUser.UserId, ct);
        return Ok(issue);
    }
}
