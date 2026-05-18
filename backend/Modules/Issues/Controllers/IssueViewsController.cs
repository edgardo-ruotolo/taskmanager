using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskManager.Api.Modules.Issues.Dtos;
using TaskManager.Api.Modules.Issues.Services;

namespace TaskManager.Api.Modules.Issues.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/views")]
[Authorize]
public class IssueViewsController(IIssueViewService viewService) : ControllerBase
{
    private Guid CurrentUserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<IEnumerable<IssueViewDto>>> GetViews(
        string workspaceSlug,
        [FromQuery] Guid? companyId,
        CancellationToken ct)
    {
        var views = await viewService.GetAllAsync(workspaceSlug, companyId, CurrentUserId, ct);
        return Ok(views);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<IssueViewDto>> GetView(string workspaceSlug, Guid id, CancellationToken ct)
    {
        var view = await viewService.GetByIdAsync(id, CurrentUserId, ct);
        return Ok(view);
    }

    [HttpPost]
    public async Task<ActionResult<IssueViewDto>> CreateView(
        string workspaceSlug,
        [FromBody] CreateIssueViewDto dto,
        CancellationToken ct)
    {
        var view = await viewService.CreateAsync(workspaceSlug, CurrentUserId, dto, ct);
        return CreatedAtAction(nameof(GetView), new { workspaceSlug, id = view.Id }, view);
    }

    [HttpPatch("{id:guid}")]
    public async Task<ActionResult<IssueViewDto>> UpdateView(
        string workspaceSlug,
        Guid id,
        [FromBody] UpdateIssueViewDto dto,
        CancellationToken ct)
    {
        var view = await viewService.UpdateAsync(id, CurrentUserId, dto, ct);
        return Ok(view);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteView(string workspaceSlug, Guid id, CancellationToken ct)
    {
        await viewService.DeleteAsync(id, CurrentUserId, ct);
        return NoContent();
    }
}
