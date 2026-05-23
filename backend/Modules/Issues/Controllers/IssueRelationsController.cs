using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Api.Common.Authorization;
using TaskManager.Api.Modules.Issues.Dtos;
using TaskManager.Api.Modules.Issues.Services;

namespace TaskManager.Api.Modules.Issues.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/projects/{projectId:guid}/issues/{issueId:guid}/relations")]
[Authorize]
[ServiceFilter(typeof(RequireProjectMemberAttribute))]
public class IssueRelationsController(IIssueRelationService relationService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<IssueRelationDto>>> GetAll(
        string workspaceSlug, Guid projectId, Guid issueId, CancellationToken ct)
    {
        var result = await relationService.GetRelationsAsync(workspaceSlug, projectId, issueId, ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<IssueRelationDto>> Create(
        string workspaceSlug, Guid projectId, Guid issueId, [FromBody] CreateIssueRelationDto dto, CancellationToken ct)
    {
        var result = await relationService.CreateRelationAsync(workspaceSlug, projectId, issueId, dto, ct);
        return Created(string.Empty, result);
    }

    [HttpDelete("{relationId:guid}")]
    public async Task<IActionResult> Delete(
        string workspaceSlug, Guid projectId, Guid issueId, Guid relationId, CancellationToken ct)
    {
        await relationService.DeleteRelationAsync(workspaceSlug, projectId, issueId, relationId, ct);
        return NoContent();
    }
}
