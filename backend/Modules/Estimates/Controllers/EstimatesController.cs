using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Api.Common.Authorization;
using TaskManager.Api.Modules.Estimates.Dtos;
using TaskManager.Api.Modules.Estimates.Services;

namespace TaskManager.Api.Modules.Estimates.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/projects/{projectId:guid}/estimates")]
[Authorize]
[ServiceFilter(typeof(RequireProjectMemberAttribute))]
public class EstimatesController(IEstimateService estimateService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<EstimateDto>>> GetAll(
        string workspaceSlug, Guid projectId, CancellationToken ct)
    {
        var result = await estimateService.GetAllAsync(workspaceSlug, projectId, ct);
        return Ok(result);
    }

    [HttpGet("{estimateId:guid}")]
    public async Task<ActionResult<EstimateDto>> GetById(
        string workspaceSlug, Guid projectId, Guid estimateId, CancellationToken ct)
    {
        var result = await estimateService.GetByIdAsync(workspaceSlug, projectId, estimateId, ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<EstimateDto>> Create(
        string workspaceSlug, Guid projectId, [FromBody] CreateEstimateDto dto, CancellationToken ct)
    {
        var result = await estimateService.CreateAsync(workspaceSlug, projectId, dto, ct);
        return CreatedAtAction(nameof(GetById), new { workspaceSlug, projectId, estimateId = result.Id }, result);
    }

    [HttpPut("{estimateId:guid}")]
    public async Task<ActionResult<EstimateDto>> Update(
        string workspaceSlug, Guid projectId, Guid estimateId, [FromBody] UpdateEstimateDto dto, CancellationToken ct)
    {
        var result = await estimateService.UpdateAsync(workspaceSlug, projectId, estimateId, dto, ct);
        return Ok(result);
    }

    [HttpDelete("{estimateId:guid}")]
    public async Task<IActionResult> Delete(
        string workspaceSlug, Guid projectId, Guid estimateId, CancellationToken ct)
    {
        await estimateService.DeleteAsync(workspaceSlug, projectId, estimateId, ct);
        return NoContent();
    }

    [HttpPost("{estimateId:guid}/points")]
    public async Task<ActionResult<EstimatePointDto>> AddPoint(
        string workspaceSlug, Guid projectId, Guid estimateId, [FromBody] CreateEstimatePointDto dto, CancellationToken ct)
    {
        var result = await estimateService.AddPointAsync(workspaceSlug, projectId, estimateId, dto, ct);
        return Created(string.Empty, result);
    }

    [HttpDelete("{estimateId:guid}/points/{pointId:guid}")]
    public async Task<IActionResult> DeletePoint(
        string workspaceSlug, Guid projectId, Guid estimateId, Guid pointId, CancellationToken ct)
    {
        await estimateService.DeletePointAsync(workspaceSlug, projectId, estimateId, pointId, ct);
        return NoContent();
    }
}
