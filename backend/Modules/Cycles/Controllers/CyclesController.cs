using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskManager.Api.Common.Pagination;
using TaskManager.Api.Modules.Cycles.Dtos;
using TaskManager.Api.Modules.Cycles.Services;

namespace TaskManager.Api.Modules.Cycles.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/companies/{companyId:guid}/cycles")]
[Authorize]
public class CyclesController(ICycleService cycleService) : ControllerBase
{
    private Guid CurrentUserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<PagedResult<CycleDto>>> GetAll(
        string workspaceSlug,
        Guid companyId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var result = await cycleService.GetAllAsync(workspaceSlug, companyId, page, pageSize, ct);
        return Ok(result);
    }

    [HttpGet("{cycleId:guid}")]
    public async Task<ActionResult<CycleDto>> GetById(string workspaceSlug, Guid companyId, Guid cycleId, CancellationToken ct = default)
    {
        var cycle = await cycleService.GetByIdAsync(workspaceSlug, companyId, cycleId, ct);
        return Ok(cycle);
    }

    [HttpPost]
    public async Task<ActionResult<CycleDto>> Create(string workspaceSlug, Guid companyId, [FromBody] CreateCycleDto dto, CancellationToken ct = default)
    {
        var cycle = await cycleService.CreateAsync(workspaceSlug, companyId, CurrentUserId, dto, ct);
        return CreatedAtAction(nameof(GetById), new { workspaceSlug, companyId, cycleId = cycle.Id }, cycle);
    }

    [HttpPatch("{cycleId:guid}")]
    public async Task<ActionResult<CycleDto>> Update(string workspaceSlug, Guid companyId, Guid cycleId, [FromBody] UpdateCycleDto dto, CancellationToken ct = default)
    {
        var cycle = await cycleService.UpdateAsync(workspaceSlug, companyId, cycleId, dto, ct);
        return Ok(cycle);
    }

    [HttpDelete("{cycleId:guid}")]
    public async Task<IActionResult> Delete(string workspaceSlug, Guid companyId, Guid cycleId, CancellationToken ct = default)
    {
        await cycleService.DeleteAsync(workspaceSlug, companyId, cycleId, ct);
        return NoContent();
    }

    [HttpPost("{cycleId:guid}/issues")]
    public async Task<IActionResult> AddIssue(string workspaceSlug, Guid companyId, Guid cycleId, [FromBody] AddCycleIssueDto dto, CancellationToken ct = default)
    {
        await cycleService.AddIssueAsync(workspaceSlug, companyId, cycleId, dto.IssueId, CurrentUserId, ct);
        return NoContent();
    }

    [HttpDelete("{cycleId:guid}/issues/{issueId:guid}")]
    public async Task<IActionResult> RemoveIssue(string workspaceSlug, Guid companyId, Guid cycleId, Guid issueId, CancellationToken ct = default)
    {
        await cycleService.RemoveIssueAsync(workspaceSlug, companyId, cycleId, issueId, ct);
        return NoContent();
    }

    [HttpGet("archived")]
    public async Task<ActionResult<List<CycleDto>>> GetArchived(string workspaceSlug, Guid companyId, CancellationToken ct = default)
    {
        var cycles = await cycleService.GetArchivedAsync(workspaceSlug, companyId, ct);
        return Ok(cycles);
    }

    [HttpPost("{cycleId:guid}/archive")]
    public async Task<IActionResult> Archive(string workspaceSlug, Guid companyId, Guid cycleId, CancellationToken ct = default)
    {
        await cycleService.ArchiveAsync(workspaceSlug, companyId, cycleId, ct);
        return NoContent();
    }

    [HttpPost("{cycleId:guid}/unarchive")]
    public async Task<IActionResult> Unarchive(string workspaceSlug, Guid companyId, Guid cycleId, CancellationToken ct = default)
    {
        await cycleService.UnarchiveAsync(workspaceSlug, companyId, cycleId, ct);
        return NoContent();
    }
}
