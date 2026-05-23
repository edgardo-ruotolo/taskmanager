using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Api.Common.Auth;
using TaskManager.Api.Common.Authorization;
using TaskManager.Api.Common.Pagination;
using TaskManager.Api.Modules.Cycles.Dtos;
using TaskManager.Api.Modules.Cycles.Services;

namespace TaskManager.Api.Modules.Cycles.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/projects/{projectId:guid}/cycles")]
[Authorize]
[ServiceFilter(typeof(RequireProjectMemberAttribute))]
public class CyclesController(ICycleService cycleService, ICurrentUser currentUser) : ControllerBase
{

    [HttpGet]
    public async Task<ActionResult<PagedResult<CycleDto>>> GetAll(
        string workspaceSlug,
        Guid projectId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var result = await cycleService.GetAllAsync(workspaceSlug, projectId, page, pageSize, ct);
        return Ok(result);
    }

    [HttpGet("{cycleId:guid}")]
    public async Task<ActionResult<CycleDto>> GetById(string workspaceSlug, Guid projectId, Guid cycleId, CancellationToken ct = default)
    {
        var cycle = await cycleService.GetByIdAsync(workspaceSlug, projectId, cycleId, ct);
        return Ok(cycle);
    }

    [HttpPost]
    public async Task<ActionResult<CycleDto>> Create(string workspaceSlug, Guid projectId, [FromBody] CreateCycleDto dto, CancellationToken ct = default)
    {
        var cycle = await cycleService.CreateAsync(workspaceSlug, projectId, currentUser.UserId, dto, ct);
        return CreatedAtAction(nameof(GetById), new { workspaceSlug, projectId, cycleId = cycle.Id }, cycle);
    }

    [HttpPatch("{cycleId:guid}")]
    public async Task<ActionResult<CycleDto>> Update(string workspaceSlug, Guid projectId, Guid cycleId, [FromBody] UpdateCycleDto dto, CancellationToken ct = default)
    {
        var cycle = await cycleService.UpdateAsync(workspaceSlug, projectId, cycleId, dto, ct);
        return Ok(cycle);
    }

    [HttpDelete("{cycleId:guid}")]
    public async Task<IActionResult> Delete(string workspaceSlug, Guid projectId, Guid cycleId, CancellationToken ct = default)
    {
        await cycleService.DeleteAsync(workspaceSlug, projectId, cycleId, ct);
        return NoContent();
    }

    [HttpPost("{cycleId:guid}/issues")]
    public async Task<IActionResult> AddIssue(string workspaceSlug, Guid projectId, Guid cycleId, [FromBody] AddCycleIssueDto dto, CancellationToken ct = default)
    {
        await cycleService.AddIssueAsync(workspaceSlug, projectId, cycleId, dto.IssueId, currentUser.UserId, ct);
        return NoContent();
    }

    [HttpDelete("{cycleId:guid}/issues/{issueId:guid}")]
    public async Task<IActionResult> RemoveIssue(string workspaceSlug, Guid projectId, Guid cycleId, Guid issueId, CancellationToken ct = default)
    {
        await cycleService.RemoveIssueAsync(workspaceSlug, projectId, cycleId, issueId, ct);
        return NoContent();
    }

    [HttpGet("archived")]
    public async Task<ActionResult<List<CycleDto>>> GetArchived(string workspaceSlug, Guid projectId, CancellationToken ct = default)
    {
        var cycles = await cycleService.GetArchivedAsync(workspaceSlug, projectId, ct);
        return Ok(cycles);
    }

    [HttpPost("{cycleId:guid}/archive")]
    public async Task<IActionResult> Archive(string workspaceSlug, Guid projectId, Guid cycleId, CancellationToken ct = default)
    {
        await cycleService.ArchiveAsync(workspaceSlug, projectId, cycleId, ct);
        return NoContent();
    }

    [HttpPost("{cycleId:guid}/unarchive")]
    public async Task<IActionResult> Unarchive(string workspaceSlug, Guid projectId, Guid cycleId, CancellationToken ct = default)
    {
        await cycleService.UnarchiveAsync(workspaceSlug, projectId, cycleId, ct);
        return NoContent();
    }

    [HttpPost("{cycleId:guid}/transfer-issues")]
    public async Task<IActionResult> TransferIssues(string workspaceSlug, Guid projectId, Guid cycleId, [FromBody] TransferCycleIssuesDto dto, CancellationToken ct = default)
    {
        await cycleService.TransferIssuesAsync(workspaceSlug, projectId, cycleId, dto.TargetCycleId, ct);
        return NoContent();
    }

    [HttpGet("{cycleId:guid}/progress")]
    public async Task<ActionResult<CycleProgressDto>> GetProgress(string workspaceSlug, Guid projectId, Guid cycleId, CancellationToken ct = default)
    {
        var result = await cycleService.GetProgressAsync(workspaceSlug, projectId, cycleId, ct);
        return Ok(result);
    }

    [HttpGet("{cycleId:guid}/analytics")]
    public async Task<ActionResult<CycleAnalyticsDto>> GetAnalytics(string workspaceSlug, Guid projectId, Guid cycleId, CancellationToken ct = default)
    {
        var result = await cycleService.GetAnalyticsAsync(workspaceSlug, projectId, cycleId, ct);
        return Ok(result);
    }
}
