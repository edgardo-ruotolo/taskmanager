using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Api.Common.Auth;
using TaskManager.Api.Modules.Auth.Dtos;
using TaskManager.Api.Modules.Auth.Services;

namespace TaskManager.Api.Modules.Auth.Controllers;

[ApiController]
[Route("api/auth/oauth-accounts")]
[Authorize]
public class OAuthAccountsController(IOAuthAccountService oAuthAccountService, ICurrentUser currentUser) : ControllerBase
{

    [HttpGet]
    public async Task<ActionResult<List<OAuthAccountDto>>> GetAccounts(CancellationToken ct)
    {
        var accounts = await oAuthAccountService.GetAccountsAsync(currentUser.UserId, ct);
        return Ok(accounts);
    }

    [HttpDelete("{accountId:guid}")]
    public async Task<IActionResult> UnlinkAccount(Guid accountId, CancellationToken ct)
    {
        await oAuthAccountService.UnlinkAccountAsync(accountId, currentUser.UserId, ct);
        return NoContent();
    }
}
