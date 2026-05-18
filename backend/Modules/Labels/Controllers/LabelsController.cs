using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Api.Modules.Labels.Dtos;
using TaskManager.Api.Modules.Labels.Services;

namespace TaskManager.Api.Modules.Labels.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/labels")]
[Authorize]
public class LabelsController(ILabelService labelService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<LabelDto>>> GetAll(string workspaceSlug, CancellationToken ct = default)
    {
        var labels = await labelService.GetAllAsync(workspaceSlug, ct);
        return Ok(labels);
    }

    [HttpGet("{labelId:guid}")]
    public async Task<ActionResult<LabelDto>> GetById(string workspaceSlug, Guid labelId, CancellationToken ct = default)
    {
        var label = await labelService.GetByIdAsync(workspaceSlug, labelId, ct);
        return Ok(label);
    }

    [HttpPost]
    public async Task<ActionResult<LabelDto>> Create(string workspaceSlug, [FromBody] CreateLabelDto dto, CancellationToken ct = default)
    {
        var label = await labelService.CreateAsync(workspaceSlug, dto, ct);
        return CreatedAtAction(nameof(GetById), new { workspaceSlug, labelId = label.Id }, label);
    }

    [HttpPatch("{labelId:guid}")]
    public async Task<ActionResult<LabelDto>> Update(string workspaceSlug, Guid labelId, [FromBody] UpdateLabelDto dto, CancellationToken ct = default)
    {
        var label = await labelService.UpdateAsync(workspaceSlug, labelId, dto, ct);
        return Ok(label);
    }

    [HttpDelete("{labelId:guid}")]
    public async Task<IActionResult> Delete(string workspaceSlug, Guid labelId, CancellationToken ct = default)
    {
        await labelService.DeleteAsync(workspaceSlug, labelId, ct);
        return NoContent();
    }
}
