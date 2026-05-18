using System.Security.Claims;
using Hangfire;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Api.Modules.Recurring.Dtos;
using TaskManager.Api.Modules.Recurring.Services;

namespace TaskManager.Api.Modules.Recurring.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/recurring")]
[Authorize]
public class RecurringController(IRecurringService recurringService, IBackgroundJobClient backgroundJobClient) : ControllerBase
{
    private Guid CurrentUserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<List<RecurringTemplateDto>>> List(string workspaceSlug, CancellationToken ct)
    {
        var result = await recurringService.ListAsync(workspaceSlug, CurrentUserId, ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<RecurringTemplateDto>> Create(
        string workspaceSlug, [FromBody] CreateRecurringTemplateDto dto, CancellationToken ct)
    {
        var result = await recurringService.CreateAsync(workspaceSlug, CurrentUserId, dto, ct);
        return CreatedAtAction(nameof(GetById), new { workspaceSlug, id = result.Id }, result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<RecurringTemplateDto>> GetById(string workspaceSlug, Guid id, CancellationToken ct)
    {
        var result = await recurringService.GetByIdAsync(workspaceSlug, id, CurrentUserId, ct);
        return Ok(result);
    }

    [HttpPatch("{id:guid}")]
    public async Task<ActionResult<RecurringTemplateDto>> Update(
        string workspaceSlug, Guid id, [FromBody] UpdateRecurringTemplateDto dto, CancellationToken ct)
    {
        var result = await recurringService.UpdateAsync(workspaceSlug, id, CurrentUserId, dto, ct);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(string workspaceSlug, Guid id, CancellationToken ct)
    {
        await recurringService.DeleteAsync(workspaceSlug, id, CurrentUserId, ct);
        return NoContent();
    }

    [HttpGet("{id:guid}/runs")]
    public async Task<ActionResult<List<RecurringRunDto>>> GetRuns(string workspaceSlug, Guid id, CancellationToken ct)
    {
        var result = await recurringService.GetRunsAsync(workspaceSlug, id, CurrentUserId, ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}/preview")]
    public async Task<ActionResult<RecurringPreviewDto>> Preview(
        string workspaceSlug, Guid id, [FromQuery] int count = 5, CancellationToken ct = default)
    {
        var result = await recurringService.PreviewAsync(workspaceSlug, id, count, ct);
        return Ok(result);
    }

    [HttpPost("{id:guid}/pause")]
    public async Task<ActionResult<RecurringTemplateDto>> Pause(string workspaceSlug, Guid id, CancellationToken ct)
    {
        var result = await recurringService.PauseAsync(workspaceSlug, id, CurrentUserId, ct);
        return Ok(result);
    }

    [HttpPost("{id:guid}/resume")]
    public async Task<ActionResult<RecurringTemplateDto>> Resume(string workspaceSlug, Guid id, CancellationToken ct)
    {
        var result = await recurringService.ResumeAsync(workspaceSlug, id, CurrentUserId, ct);
        return Ok(result);
    }

    [HttpPost("{id:guid}/skip-next")]
    public async Task<ActionResult<RecurringTemplateDto>> SkipNext(string workspaceSlug, Guid id, CancellationToken ct)
    {
        var result = await recurringService.SkipNextAsync(workspaceSlug, id, CurrentUserId, ct);
        return Ok(result);
    }

    [HttpPost("{id:guid}/run-now")]
    public IActionResult RunNow(string workspaceSlug, Guid id)
    {
        backgroundJobClient.Enqueue<IRecurringExecutor>(e => e.ExecuteAsync(id, CancellationToken.None));
        return Accepted();
    }

    [HttpPost("from-issue/{issueId:guid}")]
    public async Task<ActionResult<RecurringFromIssuePrefillDto>> FromIssue(
        string workspaceSlug, Guid issueId, CancellationToken ct)
    {
        var result = await recurringService.FromIssueAsync(workspaceSlug, issueId, CurrentUserId, ct);
        return Ok(result);
    }
}
