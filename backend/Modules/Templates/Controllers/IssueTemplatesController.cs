using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Api.Modules.Templates.Dtos;
using TaskManager.Api.Modules.Templates.Services;

namespace TaskManager.Api.Modules.Templates.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/templates")]
[Authorize]
public class IssueTemplatesController(IIssueTemplateService templateService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<IssueTemplateDto>>> GetAll(string workspaceSlug, CancellationToken ct)
    {
        var templates = await templateService.GetAllAsync(workspaceSlug, ct);
        return Ok(templates);
    }

    [HttpGet("{templateId:guid}")]
    public async Task<ActionResult<IssueTemplateDto>> GetById(string workspaceSlug, Guid templateId, CancellationToken ct)
    {
        var template = await templateService.GetByIdAsync(workspaceSlug, templateId, ct);
        return Ok(template);
    }

    [HttpPost]
    public async Task<ActionResult<IssueTemplateDto>> Create(
        string workspaceSlug, [FromBody] CreateIssueTemplateDto dto, CancellationToken ct)
    {
        var template = await templateService.CreateAsync(workspaceSlug, dto, ct);
        return CreatedAtAction(nameof(GetById), new { workspaceSlug, templateId = template.Id }, template);
    }

    [HttpPatch("{templateId:guid}")]
    public async Task<ActionResult<IssueTemplateDto>> Update(
        string workspaceSlug, Guid templateId, [FromBody] CreateIssueTemplateDto dto, CancellationToken ct)
    {
        var template = await templateService.UpdateAsync(workspaceSlug, templateId, dto, ct);
        return Ok(template);
    }

    [HttpDelete("{templateId:guid}")]
    public async Task<IActionResult> Delete(string workspaceSlug, Guid templateId, CancellationToken ct)
    {
        await templateService.DeleteAsync(workspaceSlug, templateId, ct);
        return NoContent();
    }
}
