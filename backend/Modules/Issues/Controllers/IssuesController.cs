using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskManager.Api.Common.Pagination;
using TaskManager.Api.Modules.Issues.Dtos;
using TaskManager.Api.Modules.Issues.Services;

namespace TaskManager.Api.Modules.Issues.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/companies/{companyId:guid}/issues")]
[Authorize]
public class IssuesController(IIssueService issueService) : ControllerBase
{
    private Guid CurrentUserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpPost]
    public async Task<ActionResult<IssueDto>> Create(
        string workspaceSlug, Guid companyId, [FromBody] CreateIssueDto dto, CancellationToken ct)
    {
        var issue = await issueService.CreateAsync(workspaceSlug, companyId, CurrentUserId, dto, ct);
        return CreatedAtAction(nameof(GetById), new { workspaceSlug, companyId, issueId = issue.Id }, issue);
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<IssueDto>>> GetAll(
        string workspaceSlug, Guid companyId,
        [FromQuery] int page = 1, [FromQuery] int pageSize = 50,
        CancellationToken ct = default)
    {
        var result = await issueService.GetAllAsync(workspaceSlug, companyId, page, pageSize, ct);
        return Ok(result);
    }

    [HttpGet("{issueId:guid}")]
    public async Task<ActionResult<IssueDto>> GetById(
        string workspaceSlug, Guid companyId, Guid issueId, CancellationToken ct)
    {
        var issue = await issueService.GetByIdAsync(workspaceSlug, companyId, issueId, ct);
        return Ok(issue);
    }

    [HttpPatch("{issueId:guid}")]
    public async Task<ActionResult<IssueDto>> Update(
        string workspaceSlug, Guid companyId, Guid issueId, [FromBody] UpdateIssueDto dto, CancellationToken ct)
    {
        var issue = await issueService.UpdateAsync(workspaceSlug, companyId, issueId, dto, ct);
        return Ok(issue);
    }

    [HttpDelete("{issueId:guid}")]
    public async Task<IActionResult> Delete(
        string workspaceSlug, Guid companyId, Guid issueId, CancellationToken ct)
    {
        await issueService.DeleteAsync(workspaceSlug, companyId, issueId, ct);
        return NoContent();
    }

    [HttpPost("{issueId:guid}/assignees")]
    public async Task<IActionResult> AddAssignee(
        string workspaceSlug, Guid companyId, Guid issueId, [FromBody] AddAssigneeDto dto, CancellationToken ct)
    {
        await issueService.AddAssigneeAsync(workspaceSlug, companyId, issueId, dto.UserId, ct);
        return NoContent();
    }

    [HttpDelete("{issueId:guid}/assignees/{userId:guid}")]
    public async Task<IActionResult> RemoveAssignee(
        string workspaceSlug, Guid companyId, Guid issueId, Guid userId, CancellationToken ct)
    {
        await issueService.RemoveAssigneeAsync(workspaceSlug, companyId, issueId, userId, ct);
        return NoContent();
    }

    [HttpPost("{issueId:guid}/labels")]
    public async Task<IActionResult> AddLabel(
        string workspaceSlug, Guid companyId, Guid issueId, [FromBody] AddLabelDto dto, CancellationToken ct)
    {
        await issueService.AddLabelAsync(workspaceSlug, companyId, issueId, dto.LabelId, ct);
        return NoContent();
    }

    [HttpDelete("{issueId:guid}/labels/{labelId:guid}")]
    public async Task<IActionResult> RemoveLabel(
        string workspaceSlug, Guid companyId, Guid issueId, Guid labelId, CancellationToken ct)
    {
        await issueService.RemoveLabelAsync(workspaceSlug, companyId, issueId, labelId, ct);
        return NoContent();
    }

    [HttpGet("archived")]
    public async Task<ActionResult<List<IssueDto>>> GetArchived(
        string workspaceSlug, Guid companyId, CancellationToken ct)
    {
        var issues = await issueService.GetArchivedAsync(workspaceSlug, companyId, ct);
        return Ok(issues);
    }

    [HttpPost("{issueId:guid}/archive")]
    public async Task<IActionResult> Archive(
        string workspaceSlug, Guid companyId, Guid issueId, CancellationToken ct)
    {
        await issueService.ArchiveAsync(workspaceSlug, companyId, issueId, ct);
        return NoContent();
    }

    [HttpPost("{issueId:guid}/unarchive")]
    public async Task<IActionResult> Unarchive(
        string workspaceSlug, Guid companyId, Guid issueId, CancellationToken ct)
    {
        await issueService.UnarchiveAsync(workspaceSlug, companyId, issueId, ct);
        return NoContent();
    }

    [HttpPost("bulk-archive")]
    public async Task<IActionResult> BulkArchive(
        string workspaceSlug, Guid companyId, [FromBody] BulkArchiveDto dto, CancellationToken ct)
    {
        await issueService.BulkArchiveAsync(workspaceSlug, companyId, dto.IssueIds, ct);
        return NoContent();
    }

    [HttpPost("bulk-delete")]
    public async Task<IActionResult> BulkDelete(
        string workspaceSlug, Guid companyId, [FromBody] BulkDeleteDto dto, CancellationToken ct)
    {
        await issueService.BulkDeleteAsync(workspaceSlug, companyId, dto.IssueIds, ct);
        return NoContent();
    }

    [HttpPost("bulk-update")]
    public async Task<IActionResult> BulkUpdate(
        string workspaceSlug, Guid companyId, [FromBody] BulkUpdateIssueDto dto, CancellationToken ct)
    {
        await issueService.BulkUpdateAsync(workspaceSlug, companyId, dto.IssueIds, dto, ct);
        return NoContent();
    }
}
