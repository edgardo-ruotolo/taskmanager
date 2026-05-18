using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskManager.Api.Common.Pagination;
using TaskManager.Api.Modules.ProjectModules.Dtos;
using TaskManager.Api.Modules.ProjectModules.Services;

namespace TaskManager.Api.Modules.ProjectModules.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/companies/{companyId:guid}/modules")]
[Authorize]
public class ProjectModulesController(IProjectModuleService moduleService) : ControllerBase
{
    private Guid CurrentUserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<PagedResult<ProjectModuleDto>>> GetAll(
        string workspaceSlug,
        Guid companyId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var result = await moduleService.GetAllAsync(workspaceSlug, companyId, page, pageSize, ct);
        return Ok(result);
    }

    [HttpGet("{moduleId:guid}")]
    public async Task<ActionResult<ProjectModuleDto>> GetById(string workspaceSlug, Guid companyId, Guid moduleId, CancellationToken ct = default)
    {
        var module = await moduleService.GetByIdAsync(workspaceSlug, companyId, moduleId, ct);
        return Ok(module);
    }

    [HttpPost]
    public async Task<ActionResult<ProjectModuleDto>> Create(string workspaceSlug, Guid companyId, [FromBody] CreateProjectModuleDto dto, CancellationToken ct = default)
    {
        var module = await moduleService.CreateAsync(workspaceSlug, companyId, CurrentUserId, dto, ct);
        return CreatedAtAction(nameof(GetById), new { workspaceSlug, companyId, moduleId = module.Id }, module);
    }

    [HttpPatch("{moduleId:guid}")]
    public async Task<ActionResult<ProjectModuleDto>> Update(string workspaceSlug, Guid companyId, Guid moduleId, [FromBody] UpdateProjectModuleDto dto, CancellationToken ct = default)
    {
        var module = await moduleService.UpdateAsync(workspaceSlug, companyId, moduleId, dto, ct);
        return Ok(module);
    }

    [HttpDelete("{moduleId:guid}")]
    public async Task<IActionResult> Delete(string workspaceSlug, Guid companyId, Guid moduleId, CancellationToken ct = default)
    {
        await moduleService.DeleteAsync(workspaceSlug, companyId, moduleId, ct);
        return NoContent();
    }

    [HttpPost("{moduleId:guid}/issues")]
    public async Task<IActionResult> AddIssue(string workspaceSlug, Guid companyId, Guid moduleId, [FromBody] AddModuleIssueDto dto, CancellationToken ct = default)
    {
        await moduleService.AddIssueAsync(workspaceSlug, companyId, moduleId, dto.IssueId, CurrentUserId, ct);
        return NoContent();
    }

    [HttpDelete("{moduleId:guid}/issues/{issueId:guid}")]
    public async Task<IActionResult> RemoveIssue(string workspaceSlug, Guid companyId, Guid moduleId, Guid issueId, CancellationToken ct = default)
    {
        await moduleService.RemoveIssueAsync(workspaceSlug, companyId, moduleId, issueId, ct);
        return NoContent();
    }

    [HttpPost("{moduleId:guid}/links")]
    public async Task<IActionResult> AddLink(string workspaceSlug, Guid companyId, Guid moduleId, [FromBody] AddModuleLinkDto dto, CancellationToken ct = default)
    {
        await moduleService.AddLinkAsync(workspaceSlug, companyId, moduleId, dto, CurrentUserId, ct);
        return NoContent();
    }

    [HttpDelete("{moduleId:guid}/links/{linkId:guid}")]
    public async Task<IActionResult> RemoveLink(string workspaceSlug, Guid companyId, Guid moduleId, Guid linkId, CancellationToken ct = default)
    {
        await moduleService.RemoveLinkAsync(workspaceSlug, companyId, moduleId, linkId, ct);
        return NoContent();
    }

    [HttpPost("{moduleId:guid}/members")]
    public async Task<IActionResult> AddMember(string workspaceSlug, Guid companyId, Guid moduleId, [FromBody] AddModuleMemberDto dto, CancellationToken ct = default)
    {
        await moduleService.AddMemberAsync(workspaceSlug, companyId, moduleId, dto.UserId, ct);
        return NoContent();
    }

    [HttpDelete("{moduleId:guid}/members/{memberId:guid}")]
    public async Task<IActionResult> RemoveMember(string workspaceSlug, Guid companyId, Guid moduleId, Guid memberId, CancellationToken ct = default)
    {
        await moduleService.RemoveMemberAsync(workspaceSlug, companyId, moduleId, memberId, ct);
        return NoContent();
    }

    [HttpGet("archived")]
    public async Task<ActionResult<List<ProjectModuleDto>>> GetArchived(string workspaceSlug, Guid companyId, CancellationToken ct = default)
    {
        var modules = await moduleService.GetArchivedAsync(workspaceSlug, companyId, ct);
        return Ok(modules);
    }

    [HttpPost("{moduleId:guid}/archive")]
    public async Task<IActionResult> Archive(string workspaceSlug, Guid companyId, Guid moduleId, CancellationToken ct = default)
    {
        await moduleService.ArchiveAsync(workspaceSlug, companyId, moduleId, ct);
        return NoContent();
    }

    [HttpPost("{moduleId:guid}/unarchive")]
    public async Task<IActionResult> Unarchive(string workspaceSlug, Guid companyId, Guid moduleId, CancellationToken ct = default)
    {
        await moduleService.UnarchiveAsync(workspaceSlug, companyId, moduleId, ct);
        return NoContent();
    }
}
