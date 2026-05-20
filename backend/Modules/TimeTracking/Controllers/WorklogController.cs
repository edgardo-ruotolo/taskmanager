using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Api.Common.Auth;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.TimeTracking.Dtos;
using TaskManager.Api.Modules.TimeTracking.Entities;

namespace TaskManager.Api.Modules.TimeTracking.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/issues/{issueId:guid}/worklogs")]
[Authorize]
public class WorklogController(AppDbContext db, ICurrentUser currentUser) : ControllerBase
{

    [HttpGet]
    public async Task<ActionResult<List<WorklogDto>>> GetAll(
        string workspaceSlug,
        Guid issueId,
        CancellationToken ct)
    {
        var issue = await db.Issues.FirstOrDefaultAsync(i => i.Id == issueId, ct);
        if (issue is null) return NotFound(new { message = "Issue not found." });

        var worklogs = await db.IssueWorklogs
            .Include(w => w.User)
            .Where(w => w.IssueId == issueId)
            .OrderByDescending(w => w.StartedAt)
            .ToListAsync(ct);

        return Ok(worklogs.Select(MapToDto));
    }

    [HttpGet("summary")]
    public async Task<ActionResult<WorklogSummaryDto>> GetSummary(
        string workspaceSlug,
        Guid issueId,
        CancellationToken ct)
    {
        var issue = await db.Issues.FirstOrDefaultAsync(i => i.Id == issueId, ct);
        if (issue is null) return NotFound(new { message = "Issue not found." });

        var worklogs = await db.IssueWorklogs
            .Include(w => w.User)
            .Where(w => w.IssueId == issueId)
            .ToListAsync(ct);

        var totalMinutes = worklogs.Sum(w => w.DurationMinutes ?? 0);

        var byUser = worklogs
            .GroupBy(w => w.UserId)
            .Select(g => new WorklogByUserDto
            {
                UserId = g.Key,
                UserDisplayName = g.First().User.DisplayName ?? g.First().User.UserName,
                UserEmail = g.First().User.Email,
                TotalMinutes = g.Sum(w => w.DurationMinutes ?? 0)
            })
            .ToList();

        return Ok(new WorklogSummaryDto
        {
            TotalMinutes = totalMinutes,
            TotalHours = Math.Round(totalMinutes / 60.0, 2),
            ByUser = byUser
        });
    }

    [HttpPost]
    public async Task<ActionResult<WorklogDto>> Create(
        string workspaceSlug,
        Guid issueId,
        [FromBody] CreateWorklogDto dto,
        CancellationToken ct)
    {
        var issue = await db.Issues.FirstOrDefaultAsync(i => i.Id == issueId, ct);
        if (issue is null) return NotFound(new { message = "Issue not found." });

        // Calculate duration from start/end if not provided manually
        int? durationMinutes = dto.DurationMinutes;
        if (durationMinutes is null && dto.EndedAt.HasValue)
            durationMinutes = (int)(dto.EndedAt.Value - dto.StartedAt).TotalMinutes;

        var worklog = new IssueWorklog
        {
            IssueId = issueId,
            UserId = currentUser.UserId,
            StartedAt = dto.StartedAt,
            EndedAt = dto.EndedAt,
            DurationMinutes = durationMinutes,
            Description = dto.Description
        };

        db.IssueWorklogs.Add(worklog);
        await db.SaveChangesAsync(ct);

        // Load user for response mapping
        await db.Entry(worklog).Reference(w => w.User).LoadAsync(ct);

        return CreatedAtAction(nameof(GetAll), new { workspaceSlug, issueId }, MapToDto(worklog));
    }

    [HttpPatch("{id:guid}")]
    public async Task<ActionResult<WorklogDto>> Update(
        string workspaceSlug,
        Guid issueId,
        Guid id,
        [FromBody] UpdateWorklogDto dto,
        CancellationToken ct)
    {
        var worklog = await db.IssueWorklogs
            .Include(w => w.User)
            .FirstOrDefaultAsync(w => w.Id == id && w.IssueId == issueId, ct);

        if (worklog is null) return NotFound(new { message = "Worklog not found." });
        if (worklog.UserId != currentUser.UserId)
            return Forbid();

        if (dto.StartedAt.HasValue) worklog.StartedAt = dto.StartedAt.Value;
        if (dto.EndedAt.HasValue) worklog.EndedAt = dto.EndedAt;
        if (dto.DurationMinutes.HasValue) worklog.DurationMinutes = dto.DurationMinutes;
        if (dto.Description is not null) worklog.Description = dto.Description;

        // Recalculate duration if start/end changed but minutes not explicitly set
        if ((dto.StartedAt.HasValue || dto.EndedAt.HasValue) && !dto.DurationMinutes.HasValue && worklog.EndedAt.HasValue)
            worklog.DurationMinutes = (int)(worklog.EndedAt.Value - worklog.StartedAt).TotalMinutes;

        await db.SaveChangesAsync(ct);

        return Ok(MapToDto(worklog));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(
        string workspaceSlug,
        Guid issueId,
        Guid id,
        CancellationToken ct)
    {
        var worklog = await db.IssueWorklogs
            .FirstOrDefaultAsync(w => w.Id == id && w.IssueId == issueId, ct);

        if (worklog is null) return NotFound(new { message = "Worklog not found." });
        if (worklog.UserId != currentUser.UserId)
            return Forbid();

        worklog.IsDeleted = true;
        worklog.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);

        return NoContent();
    }

    private static WorklogDto MapToDto(IssueWorklog w) => new()
    {
        Id = w.Id,
        IssueId = w.IssueId,
        UserId = w.UserId,
        UserDisplayName = w.User?.DisplayName ?? w.User?.UserName,
        UserEmail = w.User?.Email,
        StartedAt = w.StartedAt,
        EndedAt = w.EndedAt,
        DurationMinutes = w.DurationMinutes,
        Description = w.Description,
        CreatedAt = w.CreatedAt,
        UpdatedAt = w.UpdatedAt
    };
}
