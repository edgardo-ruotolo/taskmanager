using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Api.Common.Auth;
using TaskManager.Api.Common.Authorization;
using TaskManager.Api.Modules.Issues.Dtos;
using TaskManager.Api.Modules.Issues.Services;

namespace TaskManager.Api.Modules.Issues.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/companies/{companyId:guid}/issues/{issueId:guid}/versions")]
[Authorize]
[ServiceFilter(typeof(RequireCompanyMemberAttribute))]
public class IssueVersionsController(IIssueVersionService versionService, ICurrentUser currentUser) : ControllerBase
{

    [HttpGet]
    public async Task<ActionResult<List<IssueVersionDto>>> GetAll(
        string workspaceSlug, Guid companyId, Guid issueId, CancellationToken ct)
    {
        var result = await versionService.GetVersionsAsync(workspaceSlug, companyId, issueId, ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<IssueVersionDto>> Save(
        string workspaceSlug, Guid companyId, Guid issueId, [FromBody] CreateIssueVersionDto dto, CancellationToken ct)
    {
        var result = await versionService.SaveVersionAsync(workspaceSlug, companyId, issueId, currentUser.UserId, dto, ct);
        return Created(string.Empty, result);
    }
}
