using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskManager.Api.Modules.Auth.Dtos;
using TaskManager.Api.Modules.Auth.Services;

namespace TaskManager.Api.Modules.Auth.Controllers;

[ApiController]
[Route("api/auth/oauth-accounts")]
[Authorize]
public class OAuthAccountsController(IOAuthAccountService oAuthAccountService) : ControllerBase
{
    private Guid CurrentUserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<List<OAuthAccountDto>>> GetAccounts(CancellationToken ct)
    {
        var accounts = await oAuthAccountService.GetAccountsAsync(CurrentUserId, ct);
        return Ok(accounts);
    }

    [HttpDelete("{accountId:guid}")]
    public async Task<IActionResult> UnlinkAccount(Guid accountId, CancellationToken ct)
    {
        await oAuthAccountService.UnlinkAccountAsync(accountId, CurrentUserId, ct);
        return NoContent();
    }
}
