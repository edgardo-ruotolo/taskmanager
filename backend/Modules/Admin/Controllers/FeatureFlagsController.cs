using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Api.Modules.Admin.Dtos;
using TaskManager.Api.Modules.Admin.Services;

namespace TaskManager.Api.Modules.Admin.Controllers;

[ApiController]
[Authorize(Roles = "SuperAdmin")]
[Route("api/admin/feature-flags")]
public class FeatureFlagsController(IFeatureFlagService flags) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<FeatureFlagDto>>> GetAll(CancellationToken ct = default)
        => Ok(await flags.GetAllAsync(ct));

    [HttpPatch("{key}")]
    public async Task<ActionResult<FeatureFlagDto>> Upsert(
        string key,
        [FromBody] UpdateFeatureFlagDto dto,
        CancellationToken ct = default)
        => Ok(await flags.UpsertAsync(key, dto, ct));
}
