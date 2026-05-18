using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Integrations.Dtos;
using TaskManager.Api.Modules.Integrations.Entities;

namespace TaskManager.Api.Modules.Integrations.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/integrations/github")]
[Authorize]
public class GitHubIntegrationController(AppDbContext db, IMapper mapper) : ControllerBase
{
    [HttpGet("status")]
    public async Task<ActionResult> GetStatus(string workspaceSlug, CancellationToken ct)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct);
        if (workspace is null) return NotFound();

        var integration = await db.WorkspaceIntegrations
            .FirstOrDefaultAsync(i => i.WorkspaceId == workspace.Id && i.Provider == "github", ct);

        var repos = integration is not null
            ? await db.GitHubRepositories
                .Where(r => r.WorkspaceId == workspace.Id)
                .ToListAsync(ct)
            : [];

        return Ok(new
        {
            isConnected = integration?.IsConnected ?? false,
            accountName = integration?.ExternalAccountName,
            repos = mapper.Map<List<GitHubRepositoryDto>>(repos)
        });
    }

    [HttpPost("connect")]
    public ActionResult Connect(string workspaceSlug, [FromBody] ConnectIntegrationDto dto)
    {
        return Ok(new { success = false, message = "OAuth no configurado en este entorno." });
    }

    [HttpDelete("disconnect")]
    public async Task<ActionResult> Disconnect(string workspaceSlug, CancellationToken ct)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct);
        if (workspace is null) return NotFound();

        var integration = await db.WorkspaceIntegrations
            .FirstOrDefaultAsync(i => i.WorkspaceId == workspace.Id && i.Provider == "github", ct);

        if (integration is not null)
        {
            integration.IsConnected = false;
            integration.IsDeleted = true;
            integration.DeletedAt = DateTime.UtcNow;
            await db.SaveChangesAsync(ct);
        }

        return NoContent();
    }

    [HttpGet("repos")]
    public async Task<ActionResult<List<GitHubRepositoryDto>>> GetRepos(string workspaceSlug, CancellationToken ct)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct);
        if (workspace is null) return NotFound();

        var repos = await db.GitHubRepositories
            .Where(r => r.WorkspaceId == workspace.Id)
            .ToListAsync(ct);

        return Ok(mapper.Map<List<GitHubRepositoryDto>>(repos));
    }

    [HttpPost("repos")]
    public async Task<ActionResult<GitHubRepositoryDto>> AddRepo(
        string workspaceSlug,
        [FromBody] CreateGitHubRepositoryDto dto,
        CancellationToken ct)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct);
        if (workspace is null) return NotFound();

        var repo = mapper.Map<GitHubRepository>(dto);
        repo.WorkspaceId = workspace.Id;
        repo.FullName = $"{dto.RepoOwner}/{dto.RepoName}";

        db.GitHubRepositories.Add(repo);
        await db.SaveChangesAsync(ct);

        return CreatedAtAction(nameof(GetRepos), new { workspaceSlug }, mapper.Map<GitHubRepositoryDto>(repo));
    }

    [HttpDelete("repos/{repoId:guid}")]
    public async Task<ActionResult> DeleteRepo(string workspaceSlug, Guid repoId, CancellationToken ct)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct);
        if (workspace is null) return NotFound();

        var repo = await db.GitHubRepositories
            .FirstOrDefaultAsync(r => r.Id == repoId && r.WorkspaceId == workspace.Id, ct);

        if (repo is null) return NotFound();

        repo.IsDeleted = true;
        repo.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);

        return NoContent();
    }
}
