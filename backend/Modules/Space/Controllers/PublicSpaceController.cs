using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Space.Dtos;

namespace TaskManager.Api.Modules.Space.Controllers;

[ApiController]
[Route("api/public/space")]
public class PublicSpaceController(AppDbContext db) : ControllerBase
{
    [HttpGet("{token}")]
    public async Task<ActionResult<PublicSpaceResponseDto>> GetByToken(string token, CancellationToken ct)
    {
        var board = await db.DeployBoards
            .FirstOrDefaultAsync(b => b.Token == token, ct);

        if (board is null || !board.IsPublic) return NotFound();

        var issuesQuery = db.Issues
            .Where(i => i.CompanyId == board.CompanyId);

        var issues = await issuesQuery
            .Include(i => i.State)
            .Include(i => i.Assignees).ThenInclude(a => a.User)
            .Select(i => new PublicSpaceIssueDto
            {
                Id = i.Id,
                Title = i.Title,
                Priority = board.ShowPriority ? i.Priority.ToString() : null,
                StateName = board.ShowState ? i.State.Name : null,
                Assignees = board.ShowAssignees
                    ? i.Assignees.Select(a => new PublicSpaceAssigneeDto
                    {
                        UserId = a.UserId,
                        DisplayName = a.User.DisplayName ?? a.User.UserName ?? "",
                        AvatarUrl = a.User.AvatarUrl
                    }).ToList()
                    : new List<PublicSpaceAssigneeDto>()
            })
            .ToListAsync(ct);

        var response = new PublicSpaceResponseDto
        {
            Id = board.Id,
            Token = board.Token,
            Title = board.Title,
            Description = board.Description,
            ShowVoting = board.ShowVoting,
            ShowComments = board.ShowComments,
            ShowPriority = board.ShowPriority,
            ShowState = board.ShowState,
            ShowAssignees = board.ShowAssignees,
            Issues = issues
        };

        return Ok(response);
    }
}
