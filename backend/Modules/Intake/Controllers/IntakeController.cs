using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskManager.Api.Common.Pagination;
using TaskManager.Api.Modules.Intake.Dtos;
using TaskManager.Api.Modules.Intake.Services;

namespace TaskManager.Api.Modules.Intake.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/companies/{companyId}/intake")]
[Authorize]
public class IntakeController(IIntakeService intakeService) : ControllerBase
{
    private Guid CurrentUserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<PagedResult<IntakeIssueDto>>> GetAll(
        Guid companyId,
        [FromQuery] string? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
        => Ok(await intakeService.GetAllAsync(companyId, status, page, pageSize, ct));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<IntakeIssueDto>> GetById(
        Guid id,
        CancellationToken ct)
        => Ok(await intakeService.GetByIdAsync(id, ct));

    [HttpPost]
    public async Task<ActionResult<IntakeIssueDto>> Create(
        Guid companyId,
        [FromBody] CreateIntakeIssueDto dto,
        CancellationToken ct)
    {
        var result = await intakeService.CreateAsync(companyId, dto, ct);
        return CreatedAtAction(nameof(GetById), new { workspaceSlug = RouteData.Values["workspaceSlug"], companyId, id = result.Id }, result);
    }

    [HttpPatch("{id:guid}/review")]
    public async Task<ActionResult<IntakeIssueDto>> Review(
        Guid id,
        [FromBody] ReviewIntakeIssueDto dto,
        CancellationToken ct)
        => Ok(await intakeService.ReviewAsync(id, CurrentUserId, dto, ct));

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await intakeService.DeleteAsync(id, ct);
        return NoContent();
    }
}
