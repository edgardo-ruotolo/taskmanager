using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Workspaces.Dtos;
using TaskManager.Api.Modules.Workspaces.Entities;

namespace TaskManager.Api.Modules.Workspaces.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/theme")]
[Authorize]
public class WorkspaceThemeController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<WorkspaceThemeDto>> Get(string workspaceSlug, CancellationToken ct)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct);
        if (workspace is null) return NotFound();

        var theme = await db.WorkspaceThemes.FirstOrDefaultAsync(t => t.WorkspaceId == workspace.Id, ct);
        if (theme is null)
            return Ok(new WorkspaceThemeDto { WorkspaceId = workspace.Id });

        return Ok(MapToDto(theme));
    }

    [HttpPatch]
    public async Task<ActionResult<WorkspaceThemeDto>> Update(
        string workspaceSlug, [FromBody] UpdateWorkspaceThemeDto dto, CancellationToken ct)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct);
        if (workspace is null) return NotFound();

        var theme = await db.WorkspaceThemes.FirstOrDefaultAsync(t => t.WorkspaceId == workspace.Id, ct);
        if (theme is null)
        {
            theme = new WorkspaceTheme { WorkspaceId = workspace.Id };
            db.WorkspaceThemes.Add(theme);
        }

        if (dto.Theme is not null) theme.Theme = dto.Theme;
        if (dto.PrimaryColor is not null) theme.PrimaryColor = dto.PrimaryColor;
        if (dto.TextColor is not null) theme.TextColor = dto.TextColor;
        if (dto.BackgroundColor is not null) theme.BackgroundColor = dto.BackgroundColor;
        if (dto.SidebarColor is not null) theme.SidebarColor = dto.SidebarColor;
        if (dto.AccentColor is not null) theme.AccentColor = dto.AccentColor;

        await db.SaveChangesAsync(ct);
        return Ok(MapToDto(theme));
    }

    private static WorkspaceThemeDto MapToDto(WorkspaceTheme t) => new()
    {
        Id = t.Id, WorkspaceId = t.WorkspaceId, Theme = t.Theme,
        PrimaryColor = t.PrimaryColor, TextColor = t.TextColor,
        BackgroundColor = t.BackgroundColor, SidebarColor = t.SidebarColor,
        AccentColor = t.AccentColor
    };
}
