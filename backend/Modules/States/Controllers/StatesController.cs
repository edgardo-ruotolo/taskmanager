using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Api.Modules.States.Dtos;
using TaskManager.Api.Modules.States.Services;

namespace TaskManager.Api.Modules.States.Controllers;

[ApiController]
[Route("api/states")]
public class StatesController(IStateService stateService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<StateDto>>> GetAll(
        [FromQuery] Guid? stateGroupId,
        CancellationToken ct)
    {
        var states = await stateService.GetAllAsync(stateGroupId, ct);
        return Ok(states);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<StateDto>> Create([FromBody] CreateStateDto dto, CancellationToken ct)
    {
        var state = await stateService.CreateAsync(dto, ct);
        return CreatedAtAction(nameof(GetAll), state);
    }

    [HttpPatch("{stateId:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<StateDto>> Update(Guid stateId, [FromBody] UpdateStateDto dto, CancellationToken ct)
    {
        var state = await stateService.UpdateAsync(stateId, dto, ct);
        return Ok(state);
    }

    [HttpDelete("{stateId:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid stateId, CancellationToken ct)
    {
        await stateService.DeleteAsync(stateId, ct);
        return NoContent();
    }
}
