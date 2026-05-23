using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Api.Common.Auth;
using TaskManager.Api.Common.Authorization;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Space.Dtos;
using TaskManager.Api.Modules.Space.Entities;

namespace TaskManager.Api.Modules.Space.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/projects/{projectId:guid}/deploy-boards")]
[Authorize]
[ServiceFilter(typeof(RequireProjectMemberAttribute))]
public class DeployBoardController(AppDbContext db) : ControllerBase
{

    [HttpGet]
    public async Task<ActionResult<List<DeployBoardDto>>> GetAll(
        string workspaceSlug,
        Guid projectId,
        CancellationToken ct)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct);
        if (workspace is null) return NotFound();

        var boards = await db.DeployBoards
            .Where(b => b.ProjectId == projectId && b.WorkspaceId == workspace.Id)
            .Select(b => new DeployBoardDto
            {
                Id = b.Id,
                ProjectId = b.ProjectId,
                WorkspaceId = b.WorkspaceId,
                Token = b.Token,
                Title = b.Title,
                Description = b.Description,
                IsPublic = b.IsPublic,
                ShowVoting = b.ShowVoting,
                ShowComments = b.ShowComments,
                ShowPriority = b.ShowPriority,
                ShowState = b.ShowState,
                ShowAssignees = b.ShowAssignees,
                CreatedAt = b.CreatedAt
            })
            .ToListAsync(ct);

        return Ok(boards);
    }

    [HttpPost]
    public async Task<ActionResult<DeployBoardDto>> Create(
        string workspaceSlug,
        Guid projectId,
        [FromBody] CreateDeployBoardDto dto,
        CancellationToken ct)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct);
        if (workspace is null) return NotFound();

        var project = await db.Projects.FirstOrDefaultAsync(c => c.Id == projectId && c.WorkspaceId == workspace.Id, ct);
        if (project is null) return NotFound();

        var board = new DeployBoard
        {
            ProjectId = projectId,
            WorkspaceId = workspace.Id,
            Token = Guid.NewGuid().ToString("N"),
            Title = dto.Title,
            Description = dto.Description,
            ShowVoting = dto.ShowVoting,
            ShowComments = dto.ShowComments,
            ShowPriority = dto.ShowPriority,
            ShowState = dto.ShowState,
            ShowAssignees = dto.ShowAssignees,
            IsPublic = true
        };

        db.DeployBoards.Add(board);
        await db.SaveChangesAsync(ct);

        var result = new DeployBoardDto
        {
            Id = board.Id,
            ProjectId = board.ProjectId,
            WorkspaceId = board.WorkspaceId,
            Token = board.Token,
            Title = board.Title,
            Description = board.Description,
            IsPublic = board.IsPublic,
            ShowVoting = board.ShowVoting,
            ShowComments = board.ShowComments,
            ShowPriority = board.ShowPriority,
            ShowState = board.ShowState,
            ShowAssignees = board.ShowAssignees,
            CreatedAt = board.CreatedAt
        };

        return CreatedAtAction(nameof(GetById), new { workspaceSlug, projectId, id = board.Id }, result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<DeployBoardDto>> GetById(
        string workspaceSlug,
        Guid projectId,
        Guid id,
        CancellationToken ct)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct);
        if (workspace is null) return NotFound();

        var board = await db.DeployBoards
            .FirstOrDefaultAsync(b => b.Id == id && b.ProjectId == projectId && b.WorkspaceId == workspace.Id, ct);

        if (board is null) return NotFound();

        return Ok(new DeployBoardDto
        {
            Id = board.Id,
            ProjectId = board.ProjectId,
            WorkspaceId = board.WorkspaceId,
            Token = board.Token,
            Title = board.Title,
            Description = board.Description,
            IsPublic = board.IsPublic,
            ShowVoting = board.ShowVoting,
            ShowComments = board.ShowComments,
            ShowPriority = board.ShowPriority,
            ShowState = board.ShowState,
            ShowAssignees = board.ShowAssignees,
            CreatedAt = board.CreatedAt
        });
    }

    [HttpPatch("{id:guid}")]
    public async Task<ActionResult<DeployBoardDto>> Update(
        string workspaceSlug,
        Guid projectId,
        Guid id,
        [FromBody] UpdateDeployBoardDto dto,
        CancellationToken ct)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct);
        if (workspace is null) return NotFound();

        var board = await db.DeployBoards
            .FirstOrDefaultAsync(b => b.Id == id && b.ProjectId == projectId && b.WorkspaceId == workspace.Id, ct);

        if (board is null) return NotFound();

        if (dto.Title is not null) board.Title = dto.Title;
        if (dto.Description is not null) board.Description = dto.Description;
        if (dto.IsPublic.HasValue) board.IsPublic = dto.IsPublic.Value;
        if (dto.ShowVoting.HasValue) board.ShowVoting = dto.ShowVoting.Value;
        if (dto.ShowComments.HasValue) board.ShowComments = dto.ShowComments.Value;
        if (dto.ShowPriority.HasValue) board.ShowPriority = dto.ShowPriority.Value;
        if (dto.ShowState.HasValue) board.ShowState = dto.ShowState.Value;
        if (dto.ShowAssignees.HasValue) board.ShowAssignees = dto.ShowAssignees.Value;

        await db.SaveChangesAsync(ct);

        return Ok(new DeployBoardDto
        {
            Id = board.Id,
            ProjectId = board.ProjectId,
            WorkspaceId = board.WorkspaceId,
            Token = board.Token,
            Title = board.Title,
            Description = board.Description,
            IsPublic = board.IsPublic,
            ShowVoting = board.ShowVoting,
            ShowComments = board.ShowComments,
            ShowPriority = board.ShowPriority,
            ShowState = board.ShowState,
            ShowAssignees = board.ShowAssignees,
            CreatedAt = board.CreatedAt
        });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(
        string workspaceSlug,
        Guid projectId,
        Guid id,
        CancellationToken ct)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct);
        if (workspace is null) return NotFound();

        var board = await db.DeployBoards
            .FirstOrDefaultAsync(b => b.Id == id && b.ProjectId == projectId && b.WorkspaceId == workspace.Id, ct);

        if (board is null) return NotFound();

        board.IsDeleted = true;
        board.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);

        return NoContent();
    }
}
