using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskManager.Api.Modules.Auth.Dtos;
using TaskManager.Api.Modules.Auth.Services;

namespace TaskManager.Api.Modules.Auth.Controllers;

[ApiController]
[Route("api/auth/tokens")]
[Authorize]
public class ApiTokensController(IApiTokenService apiTokenService) : ControllerBase
{
    private Guid CurrentUserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<List<ApiTokenDto>>> GetTokens(CancellationToken ct)
    {
        var tokens = await apiTokenService.GetTokensAsync(CurrentUserId, ct);
        return Ok(tokens);
    }

    [HttpPost]
    public async Task<ActionResult<CreateApiTokenResponseDto>> CreateToken([FromBody] CreateApiTokenDto dto, CancellationToken ct)
    {
        var response = await apiTokenService.CreateTokenAsync(CurrentUserId, dto, ct);
        return CreatedAtAction(nameof(GetTokens), response);
    }

    [HttpDelete("{tokenId:guid}")]
    public async Task<IActionResult> RevokeToken(Guid tokenId, CancellationToken ct)
    {
        await apiTokenService.RevokeTokenAsync(tokenId, CurrentUserId, ct);
        return NoContent();
    }
}
