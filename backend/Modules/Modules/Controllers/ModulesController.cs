using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Api.Common.Auth;
using TaskManager.Api.Common.Authorization;
using TaskManager.Api.Common.Pagination;
using TaskManager.Api.Modules.Modules.Dtos;
using TaskManager.Api.Modules.Modules.Services;

namespace TaskManager.Api.Modules.Modules.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/projects/{projectId:guid}/modules")]
[Authorize]
[ServiceFilter(typeof(RequireProjectMemberAttribute))]
public class ModulesController(IModuleService moduleService, ICurrentUser currentUser) : ControllerBase
{

    [HttpGet]
    public async Task<ActionResult<PagedResult<ModuleDto>>> GetAll(
        string workspaceSlug,
        Guid projectId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var result = await moduleService.GetAllAsync(workspaceSlug, projectId, page, pageSize, ct);
        return Ok(result);
    }

    [HttpGet("{moduleId:guid}")]
    public async Task<ActionResult<ModuleDto>> GetById(string workspaceSlug, Guid projectId, Guid moduleId, CancellationToken ct = default)
    {
        var module = await moduleService.GetByIdAsync(workspaceSlug, projectId, moduleId, ct);
        return Ok(module);
    }

    [HttpPost]
    public async Task<ActionResult<ModuleDto>> Create(string workspaceSlug, Guid projectId, [FromBody] CreateModuleDto dto, CancellationToken ct = default)
    {
        var module = await moduleService.CreateAsync(workspaceSlug, projectId, currentUser.UserId, dto, ct);
        return CreatedAtAction(nameof(GetById), new { workspaceSlug, projectId, moduleId = module.Id }, module);
    }

    [HttpPatch("{moduleId:guid}")]
    public async Task<ActionResult<ModuleDto>> Update(string workspaceSlug, Guid projectId, Guid moduleId, [FromBody] UpdateModuleDto dto, CancellationToken ct = default)
    {
        var module = await moduleService.UpdateAsync(workspaceSlug, projectId, moduleId, dto, ct);
        return Ok(module);
    }

    [HttpDelete("{moduleId:guid}")]
    public async Task<IActionResult> Delete(string workspaceSlug, Guid projectId, Guid moduleId, CancellationToken ct = default)
    {
        await moduleService.DeleteAsync(workspaceSlug, projectId, moduleId, ct);
        return NoContent();
    }

    [HttpPost("{moduleId:guid}/issues")]
    public async Task<IActionResult> AddIssue(string workspaceSlug, Guid projectId, Guid moduleId, [FromBody] AddModuleIssueDto dto, CancellationToken ct = default)
    {
        await moduleService.AddIssueAsync(workspaceSlug, projectId, moduleId, dto.IssueId, currentUser.UserId, ct);
        return NoContent();
    }

    [HttpDelete("{moduleId:guid}/issues/{issueId:guid}")]
    public async Task<IActionResult> RemoveIssue(string workspaceSlug, Guid projectId, Guid moduleId, Guid issueId, CancellationToken ct = default)
    {
        await moduleService.RemoveIssueAsync(workspaceSlug, projectId, moduleId, issueId, ct);
        return NoContent();
    }

    [HttpPost("{moduleId:guid}/links")]
    public async Task<IActionResult> AddLink(string workspaceSlug, Guid projectId, Guid moduleId, [FromBody] AddModuleLinkDto dto, CancellationToken ct = default)
    {
        await moduleService.AddLinkAsync(workspaceSlug, projectId, moduleId, dto, currentUser.UserId, ct);
        return NoContent();
    }

    [HttpDelete("{moduleId:guid}/links/{linkId:guid}")]
    public async Task<IActionResult> RemoveLink(string workspaceSlug, Guid projectId, Guid moduleId, Guid linkId, CancellationToken ct = default)
    {
        await moduleService.RemoveLinkAsync(workspaceSlug, projectId, moduleId, linkId, ct);
        return NoContent();
    }

    [HttpPost("{moduleId:guid}/members")]
    public async Task<IActionResult> AddMember(string workspaceSlug, Guid projectId, Guid moduleId, [FromBody] AddModuleMemberDto dto, CancellationToken ct = default)
    {
        await moduleService.AddMemberAsync(workspaceSlug, projectId, moduleId, dto.UserId, ct);
        return NoContent();
    }

    [HttpDelete("{moduleId:guid}/members/{memberId:guid}")]
    public async Task<IActionResult> RemoveMember(string workspaceSlug, Guid projectId, Guid moduleId, Guid memberId, CancellationToken ct = default)
    {
        await moduleService.RemoveMemberAsync(workspaceSlug, projectId, moduleId, memberId, ct);
        return NoContent();
    }

    [HttpGet("archived")]
    public async Task<ActionResult<List<ModuleDto>>> GetArchived(string workspaceSlug, Guid projectId, CancellationToken ct = default)
    {
        var modules = await moduleService.GetArchivedAsync(workspaceSlug, projectId, ct);
        return Ok(modules);
    }

    [HttpPost("{moduleId:guid}/archive")]
    public async Task<IActionResult> Archive(string workspaceSlug, Guid projectId, Guid moduleId, CancellationToken ct = default)
    {
        await moduleService.ArchiveAsync(workspaceSlug, projectId, moduleId, ct);
        return NoContent();
    }

    [HttpPost("{moduleId:guid}/unarchive")]
    public async Task<IActionResult> Unarchive(string workspaceSlug, Guid projectId, Guid moduleId, CancellationToken ct = default)
    {
        await moduleService.UnarchiveAsync(workspaceSlug, projectId, moduleId, ct);
        return NoContent();
    }
}
