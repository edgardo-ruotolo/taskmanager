using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Api.Common.Auth;
using TaskManager.Api.Modules.Search.Services;

namespace TaskManager.Api.Modules.Search.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/search")]
[Authorize]
public class SearchController(ISearchService searchService, ICurrentUser currentUser) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<SearchResults>> Search(
        string workspaceSlug, [FromQuery] string? q, CancellationToken ct)
        => Ok(await searchService.SearchAsync(workspaceSlug, q, currentUser.UserId, ct));
}
