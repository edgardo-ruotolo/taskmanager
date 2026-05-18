using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Space.Dtos;
using TaskManager.Api.Modules.Space.Entities;

namespace TaskManager.Api.Modules.Space.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/companies/{companyId:guid}/deploy-boards")]
[Authorize]
public class DeployBoardController(AppDbContext db) : ControllerBase
{
    private Guid CurrentUserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<List<DeployBoardDto>>> GetAll(
        string workspaceSlug,
        Guid companyId,
        CancellationToken ct)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct);
        if (workspace is null) return NotFound();

        var boards = await db.DeployBoards
            .Where(b => b.CompanyId == companyId && b.WorkspaceId == workspace.Id)
            .Select(b => new DeployBoardDto
            {
                Id = b.Id,
                CompanyId = b.CompanyId,
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
        Guid companyId,
        [FromBody] CreateDeployBoardDto dto,
        CancellationToken ct)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct);
        if (workspace is null) return NotFound();

        var company = await db.Companies.FirstOrDefaultAsync(c => c.Id == companyId && c.WorkspaceId == workspace.Id, ct);
        if (company is null) return NotFound();

        var board = new DeployBoard
        {
            CompanyId = companyId,
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
            CompanyId = board.CompanyId,
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

        return CreatedAtAction(nameof(GetById), new { workspaceSlug, companyId, id = board.Id }, result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<DeployBoardDto>> GetById(
        string workspaceSlug,
        Guid companyId,
        Guid id,
        CancellationToken ct)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct);
        if (workspace is null) return NotFound();

        var board = await db.DeployBoards
            .FirstOrDefaultAsync(b => b.Id == id && b.CompanyId == companyId && b.WorkspaceId == workspace.Id, ct);

        if (board is null) return NotFound();

        return Ok(new DeployBoardDto
        {
            Id = board.Id,
            CompanyId = board.CompanyId,
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
        Guid companyId,
        Guid id,
        [FromBody] UpdateDeployBoardDto dto,
        CancellationToken ct)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct);
        if (workspace is null) return NotFound();

        var board = await db.DeployBoards
            .FirstOrDefaultAsync(b => b.Id == id && b.CompanyId == companyId && b.WorkspaceId == workspace.Id, ct);

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
            CompanyId = board.CompanyId,
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
        Guid companyId,
        Guid id,
        CancellationToken ct)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct);
        if (workspace is null) return NotFound();

        var board = await db.DeployBoards
            .FirstOrDefaultAsync(b => b.Id == id && b.CompanyId == companyId && b.WorkspaceId == workspace.Id, ct);

        if (board is null) return NotFound();

        board.IsDeleted = true;
        board.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);

        return NoContent();
    }
}
