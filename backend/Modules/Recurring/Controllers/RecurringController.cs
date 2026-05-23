using Hangfire;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Api.Common.Auth;
using TaskManager.Api.Common.Pagination;
using TaskManager.Api.Modules.Recurring.Dtos;
using TaskManager.Api.Modules.Recurring.Entities;
using TaskManager.Api.Modules.Recurring.Services;

namespace TaskManager.Api.Modules.Recurring.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/recurring")]
[Authorize]
public class RecurringController(IRecurringService recurringService, IBackgroundJobClient backgroundJobClient, ICurrentUser currentUser) : ControllerBase
{

    [HttpGet]
    public async Task<ActionResult<PagedResult<RecurringTemplateDto>>> List(
        string workspaceSlug,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] RecurringFrequency? frequency = null,
        [FromQuery] string? status = null,
        CancellationToken ct = default)
    {
        var result = await recurringService.ListAsync(
            workspaceSlug,
            currentUser.UserId,
            page,
            pageSize,
            search,
            frequency,
            status,
            ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<RecurringTemplateDto>> Create(
        string workspaceSlug, [FromBody] CreateRecurringTemplateDto dto, CancellationToken ct)
    {
        var result = await recurringService.CreateAsync(workspaceSlug, currentUser.UserId, dto, ct);
        return CreatedAtAction(nameof(GetById), new { workspaceSlug, id = result.Id }, result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<RecurringTemplateDto>> GetById(string workspaceSlug, Guid id, CancellationToken ct)
    {
        var result = await recurringService.GetByIdAsync(workspaceSlug, id, currentUser.UserId, ct);
        return Ok(result);
    }

    [HttpPatch("{id:guid}")]
    public async Task<ActionResult<RecurringTemplateDto>> Update(
        string workspaceSlug, Guid id, [FromBody] UpdateRecurringTemplateDto dto, CancellationToken ct)
    {
        var result = await recurringService.UpdateAsync(workspaceSlug, id, currentUser.UserId, dto, ct);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(string workspaceSlug, Guid id, CancellationToken ct)
    {
        await recurringService.DeleteAsync(workspaceSlug, id, currentUser.UserId, ct);
        return NoContent();
    }

    [HttpGet("{id:guid}/runs")]
    public async Task<ActionResult<List<RecurringRunDto>>> GetRuns(string workspaceSlug, Guid id, CancellationToken ct)
    {
        var result = await recurringService.GetRunsAsync(workspaceSlug, id, currentUser.UserId, ct);
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
        var result = await recurringService.PauseAsync(workspaceSlug, id, currentUser.UserId, ct);
        return Ok(result);
    }

    [HttpPost("{id:guid}/resume")]
    public async Task<ActionResult<RecurringTemplateDto>> Resume(string workspaceSlug, Guid id, CancellationToken ct)
    {
        var result = await recurringService.ResumeAsync(workspaceSlug, id, currentUser.UserId, ct);
        return Ok(result);
    }

    [HttpPost("{id:guid}/skip-next")]
    public async Task<ActionResult<RecurringTemplateDto>> SkipNext(string workspaceSlug, Guid id, CancellationToken ct)
    {
        var result = await recurringService.SkipNextAsync(workspaceSlug, id, currentUser.UserId, ct);
        return Ok(result);
    }

    [HttpPost("{id:guid}/duplicate")]
    public async Task<ActionResult<RecurringTemplateDto>> Duplicate(string workspaceSlug, Guid id, CancellationToken ct)
    {
        var result = await recurringService.DuplicateAsync(workspaceSlug, id, currentUser.UserId, ct);
        return CreatedAtAction(nameof(GetById), new { workspaceSlug, id = result.Id }, result);
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
        var result = await recurringService.FromIssueAsync(workspaceSlug, issueId, currentUser.UserId, ct);
        return Ok(result);
    }
}
