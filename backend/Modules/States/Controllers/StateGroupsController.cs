using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Api.Modules.States.Dtos;
using TaskManager.Api.Modules.States.Services;

namespace TaskManager.Api.Modules.States.Controllers;

[ApiController]
[Authorize]
[Route("api/admin/state-groups")]
public class StateGroupsController(IStateGroupService stateGroupService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<StateGroupDto>>> GetAll(CancellationToken ct)
    {
        var groups = await stateGroupService.GetAllAsync(ct);
        return Ok(groups);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<StateGroupDto>> GetById(Guid id, CancellationToken ct)
    {
        var group = await stateGroupService.GetByIdAsync(id, ct);
        return Ok(group);
    }
}
