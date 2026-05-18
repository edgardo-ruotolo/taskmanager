using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Api.Modules.Estimates.Dtos;
using TaskManager.Api.Modules.Estimates.Services;

namespace TaskManager.Api.Modules.Estimates.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/companies/{companyId:guid}/estimates")]
[Authorize]
public class EstimatesController(IEstimateService estimateService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<EstimateDto>>> GetAll(
        string workspaceSlug, Guid companyId, CancellationToken ct)
    {
        var result = await estimateService.GetAllAsync(workspaceSlug, companyId, ct);
        return Ok(result);
    }

    [HttpGet("{estimateId:guid}")]
    public async Task<ActionResult<EstimateDto>> GetById(
        string workspaceSlug, Guid companyId, Guid estimateId, CancellationToken ct)
    {
        var result = await estimateService.GetByIdAsync(workspaceSlug, companyId, estimateId, ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<EstimateDto>> Create(
        string workspaceSlug, Guid companyId, [FromBody] CreateEstimateDto dto, CancellationToken ct)
    {
        var result = await estimateService.CreateAsync(workspaceSlug, companyId, dto, ct);
        return CreatedAtAction(nameof(GetById), new { workspaceSlug, companyId, estimateId = result.Id }, result);
    }

    [HttpPut("{estimateId:guid}")]
    public async Task<ActionResult<EstimateDto>> Update(
        string workspaceSlug, Guid companyId, Guid estimateId, [FromBody] UpdateEstimateDto dto, CancellationToken ct)
    {
        var result = await estimateService.UpdateAsync(workspaceSlug, companyId, estimateId, dto, ct);
        return Ok(result);
    }

    [HttpDelete("{estimateId:guid}")]
    public async Task<IActionResult> Delete(
        string workspaceSlug, Guid companyId, Guid estimateId, CancellationToken ct)
    {
        await estimateService.DeleteAsync(workspaceSlug, companyId, estimateId, ct);
        return NoContent();
    }

    [HttpPost("{estimateId:guid}/points")]
    public async Task<ActionResult<EstimatePointDto>> AddPoint(
        string workspaceSlug, Guid companyId, Guid estimateId, [FromBody] CreateEstimatePointDto dto, CancellationToken ct)
    {
        var result = await estimateService.AddPointAsync(workspaceSlug, companyId, estimateId, dto, ct);
        return Created(string.Empty, result);
    }

    [HttpDelete("{estimateId:guid}/points/{pointId:guid}")]
    public async Task<IActionResult> DeletePoint(
        string workspaceSlug, Guid companyId, Guid estimateId, Guid pointId, CancellationToken ct)
    {
        await estimateService.DeletePointAsync(workspaceSlug, companyId, estimateId, pointId, ct);
        return NoContent();
    }
}
