using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Api.Common.Authorization;
using TaskManager.Api.Modules.Issues.Dtos;
using TaskManager.Api.Modules.Issues.Services;

namespace TaskManager.Api.Modules.Issues.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/companies/{companyId:guid}/issues/{issueId:guid}/links")]
[Authorize]
[ServiceFilter(typeof(RequireCompanyMemberAttribute))]
public class IssueLinksController(IIssueLinkService linkService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<IssueLinkDto>>> GetAll(
        string workspaceSlug, Guid companyId, Guid issueId, CancellationToken ct)
    {
        var result = await linkService.GetLinksAsync(workspaceSlug, companyId, issueId, ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<IssueLinkDto>> Create(
        string workspaceSlug, Guid companyId, Guid issueId, [FromBody] CreateIssueLinkDto dto, CancellationToken ct)
    {
        var result = await linkService.CreateLinkAsync(workspaceSlug, companyId, issueId, dto, ct);
        return Created(string.Empty, result);
    }

    [HttpDelete("{linkId:guid}")]
    public async Task<IActionResult> Delete(
        string workspaceSlug, Guid companyId, Guid issueId, Guid linkId, CancellationToken ct)
    {
        await linkService.DeleteLinkAsync(workspaceSlug, companyId, issueId, linkId, ct);
        return NoContent();
    }
}
