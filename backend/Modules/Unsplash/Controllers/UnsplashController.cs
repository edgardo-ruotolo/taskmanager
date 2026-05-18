using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace TaskManager.Api.Modules.Unsplash.Controllers;

[ApiController]
[Route("api/unsplash")]
[Authorize]
public class UnsplashController : ControllerBase
{
    [HttpGet("search")]
    public IActionResult Search([FromQuery] string query = "")
    {
        var results = Enumerable.Range(1, 12).Select(i => new
        {
            id = $"picsum-{i * 10 + query.GetHashCode()}",
            url = $"https://picsum.photos/seed/{i * 10}/800/600",
            thumbUrl = $"https://picsum.photos/seed/{i * 10}/400/300",
            authorName = "Picsum Photos"
        });

        return Ok(results);
    }
}
