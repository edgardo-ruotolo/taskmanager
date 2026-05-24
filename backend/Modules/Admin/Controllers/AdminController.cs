using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Common.Auth;
using TaskManager.Api.Common.Pagination;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Admin.Dtos;
using TaskManager.Api.Modules.Admin.Services;
using TaskManager.Api.Modules.Auth.Entities;
using TaskManager.Api.Modules.States.Dtos;
using TaskManager.Api.Modules.States.Services;
using TaskManager.Api.Modules.Workspaces.Dtos;
using TaskManager.Api.Modules.Workspaces.Entities;

namespace TaskManager.Api.Modules.Admin.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "SuperAdmin")]
public class AdminController(
    IInstanceConfigService configService,
    AppDbContext db,
    UserManager<User> userManager,
    IStateGroupService stateGroupService,
    ICurrentUser currentUser) : ControllerBase
{
    [HttpGet("config")]
    public async Task<ActionResult<InstanceConfigDto>> GetConfig(CancellationToken ct)
    {
        var config = await configService.GetAsync(ct);
        return Ok(config);
    }

    [HttpPatch("config")]
    public async Task<ActionResult<InstanceConfigDto>> UpdateConfig(
        [FromBody] UpdateInstanceConfigDto dto,
        CancellationToken ct)
    {
        var config = await configService.UpdateAsync(dto, ct);
        return Ok(config);
    }

    [HttpGet("workspaces")]
    public async Task<ActionResult<PagedResult<WorkspaceDto>>> GetWorkspaces(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var query = db.Workspaces.OrderBy(w => w.Name);
        var total = await query.CountAsync(ct);
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(w => new WorkspaceDto
            {
                Id = w.Id,
                Name = w.Name,
                Slug = w.Slug,
                Description = w.Description,
                LogoUrl = w.LogoUrl,
                OwnerId = w.OwnerId,
                CreatedAt = w.CreatedAt
            })
            .ToListAsync(ct);

        return Ok(new PagedResult<WorkspaceDto>
        {
            Items = items,
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        });
    }

    [HttpPost("workspaces")]
    public async Task<ActionResult<WorkspaceDto>> CreateWorkspace(
        [FromBody] CreateWorkspaceDto dto,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest(new { error = "El nombre del workspace es requerido." });

        var slug = string.IsNullOrWhiteSpace(dto.Slug) ? Slugify(dto.Name) : Slugify(dto.Slug);
        if (string.IsNullOrEmpty(slug))
            return BadRequest(new { error = "El slug no puede estar vacío." });

        var slugExists = await db.Workspaces.AnyAsync(w => w.Slug == slug, ct);
        if (slugExists)
            return Conflict(new { error = "Ya existe un workspace con ese slug." });

        var workspace = new Workspace
        {
            Name = dto.Name.Trim(),
            Slug = slug,
            Description = dto.Description,
            OwnerId = currentUser.UserId
        };

        db.Workspaces.Add(workspace);
        await db.SaveChangesAsync(ct);

        return Ok(new WorkspaceDto
        {
            Id = workspace.Id,
            Name = workspace.Name,
            Slug = workspace.Slug,
            Description = workspace.Description,
            LogoUrl = workspace.LogoUrl,
            OwnerId = workspace.OwnerId,
            CreatedAt = workspace.CreatedAt
        });
    }

    [HttpPut("workspaces/{id:guid}")]
    public async Task<ActionResult<WorkspaceDto>> UpdateWorkspace(
        Guid id,
        [FromBody] UpdateWorkspaceDto dto,
        CancellationToken ct)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Id == id, ct);
        if (workspace is null) return NotFound();

        if (dto.Name is not null) workspace.Name = dto.Name.Trim();
        if (dto.Description is not null) workspace.Description = dto.Description;
        if (dto.LogoUrl is not null) workspace.LogoUrl = dto.LogoUrl;

        await db.SaveChangesAsync(ct);

        return Ok(new WorkspaceDto
        {
            Id = workspace.Id,
            Name = workspace.Name,
            Slug = workspace.Slug,
            Description = workspace.Description,
            LogoUrl = workspace.LogoUrl,
            OwnerId = workspace.OwnerId,
            CreatedAt = workspace.CreatedAt
        });
    }

    [HttpDelete("workspaces/{id:guid}")]
    public async Task<IActionResult> DeleteWorkspace(Guid id, CancellationToken ct)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Id == id, ct);
        if (workspace is null) return NotFound();

        workspace.IsDeleted = true;
        workspace.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);

        return NoContent();
    }

    [HttpGet("workspaces/{id:guid}/members")]
    public async Task<ActionResult<List<AdminWorkspaceMemberDto>>> GetWorkspaceMembers(
        Guid id,
        CancellationToken ct)
    {
        var workspaceExists = await db.Workspaces.AnyAsync(w => w.Id == id, ct);
        if (!workspaceExists) return NotFound(new { error = "Workspace not found." });

        var members = await db.WorkspaceMembers
            .Where(m => m.WorkspaceId == id)
            .Include(m => m.User)
            .Select(m => new AdminWorkspaceMemberDto
            {
                UserId = m.UserId,
                Email = m.User.Email ?? string.Empty,
                DisplayName = m.User.DisplayName ?? m.User.UserName,
                Role = m.Role.ToString()
            })
            .ToListAsync(ct);

        return Ok(members);
    }

    [HttpPost("workspaces/{id:guid}/members")]
    public async Task<ActionResult<AdminWorkspaceMemberDto>> AddWorkspaceMember(
        Guid id,
        [FromBody] AdminAddWorkspaceMemberDto dto,
        CancellationToken ct)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Id == id, ct);
        if (workspace is null) return NotFound(new { error = "Workspace not found." });

        var user = await userManager.FindByIdAsync(dto.UserId.ToString());
        if (user is null) return NotFound(new { error = "User not found." });

        var exists = await db.WorkspaceMembers.AnyAsync(
            m => m.WorkspaceId == id && m.UserId == dto.UserId, ct);
        if (exists) return Conflict(new { error = "El usuario ya es miembro de este workspace." });

        if (!Enum.TryParse<WorkspaceRole>(dto.Role, ignoreCase: false, out var role)
            || (role != WorkspaceRole.Admin && role != WorkspaceRole.Member))
        {
            return BadRequest(new { error = "Rol inválido. Valores permitidos: Admin, Member." });
        }

        var member = new WorkspaceMember
        {
            WorkspaceId = id,
            UserId = dto.UserId,
            Role = role
        };

        db.WorkspaceMembers.Add(member);
        await db.SaveChangesAsync(ct);

        return Ok(new AdminWorkspaceMemberDto
        {
            UserId = user.Id,
            Email = user.Email ?? string.Empty,
            DisplayName = user.DisplayName ?? user.UserName,
            Role = role.ToString()
        });
    }

    [HttpDelete("workspaces/{id:guid}/members/{userId:guid}")]
    public async Task<IActionResult> RemoveWorkspaceMember(
        Guid id,
        Guid userId,
        CancellationToken ct)
    {
        var member = await db.WorkspaceMembers
            .FirstOrDefaultAsync(m => m.WorkspaceId == id && m.UserId == userId, ct);

        if (member is null) return NotFound();

        db.WorkspaceMembers.Remove(member);
        await db.SaveChangesAsync(ct);

        return NoContent();
    }

    private static string Slugify(string input)
    {
        var lower = input.Trim().ToLowerInvariant();
        var normalized = Regex.Replace(lower, "[^a-z0-9]+", "-");
        return normalized.Trim('-');
    }

    [HttpGet("users")]
    public async Task<ActionResult<PagedResult<AdminUserDto>>> GetUsers(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var query = userManager.Users.OrderBy(u => u.CreatedAt);
        var total = await query.CountAsync(ct);
        var users = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        var dtos = new List<AdminUserDto>(users.Count);
        foreach (var user in users)
        {
            var roles = await userManager.GetRolesAsync(user);
            dtos.Add(new AdminUserDto
            {
                Id = user.Id,
                Email = user.Email ?? string.Empty,
                Username = user.UserName ?? string.Empty,
                FirstName = user.FirstName,
                LastName = user.LastName,
                DisplayName = user.DisplayName,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt,
                Roles = roles
            });
        }

        return Ok(new PagedResult<AdminUserDto>
        {
            Items = dtos,
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        });
    }

    [HttpPost("users")]
    public async Task<ActionResult<AdminUserDto>> CreateUser(
        [FromBody] CreateAdminUserDto dto,
        CancellationToken ct)
    {
        var user = new User
        {
            Email = dto.Email,
            UserName = dto.Username,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            DisplayName = dto.FirstName is not null
                ? $"{dto.FirstName} {dto.LastName}".Trim()
                : dto.Username,
            IsActive = true
        };

        var result = await userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
            return BadRequest(new { error = string.Join(", ", result.Errors.Select(e => e.Description)) });

        if (dto.Role == "SuperAdmin")
            await userManager.AddToRoleAsync(user, "SuperAdmin");
        else if (dto.Role == "Administrador")
            await userManager.AddToRoleAsync(user, "Administrador");

        var roles = await userManager.GetRolesAsync(user);
        return Ok(new AdminUserDto
        {
            Id = user.Id,
            Email = user.Email ?? string.Empty,
            Username = user.UserName ?? string.Empty,
            FirstName = user.FirstName,
            LastName = user.LastName,
            DisplayName = user.DisplayName,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            Roles = roles
        });
    }

    [HttpPut("users/{id:guid}")]
    public async Task<ActionResult<AdminUserDto>> UpdateUser(
        Guid id,
        [FromBody] UpdateAdminUserDto dto,
        CancellationToken ct)
    {
        var user = await userManager.FindByIdAsync(id.ToString());
        if (user is null) return NotFound();

        if (dto.FirstName is not null) user.FirstName = dto.FirstName;
        if (dto.LastName is not null) user.LastName = dto.LastName;
        if (dto.DisplayName is not null) user.DisplayName = dto.DisplayName;
        if (dto.IsActive.HasValue) user.IsActive = dto.IsActive.Value;

        var updateResult = await userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
            return BadRequest(new { error = string.Join(", ", updateResult.Errors.Select(e => e.Description)) });

        if (dto.Role is not null)
        {
            var currentRoles = await userManager.GetRolesAsync(user);
            await userManager.RemoveFromRolesAsync(user, currentRoles);
            if (dto.Role == "SuperAdmin")
                await userManager.AddToRoleAsync(user, "SuperAdmin");
            else if (dto.Role == "Administrador")
                await userManager.AddToRoleAsync(user, "Administrador");
        }

        var roles = await userManager.GetRolesAsync(user);
        return Ok(new AdminUserDto
        {
            Id = user.Id,
            Email = user.Email ?? string.Empty,
            Username = user.UserName ?? string.Empty,
            FirstName = user.FirstName,
            LastName = user.LastName,
            DisplayName = user.DisplayName,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            Roles = roles
        });
    }

    [HttpDelete("users/{id:guid}")]
    public async Task<IActionResult> DeleteUser(Guid id, CancellationToken ct)
    {
        var user = await userManager.FindByIdAsync(id.ToString());
        if (user is null) return NotFound();

        var result = await userManager.DeleteAsync(user);
        if (!result.Succeeded)
            return BadRequest(new { error = string.Join(", ", result.Errors.Select(e => e.Description)) });

        return NoContent();
    }

    // ─── State Groups ────────────────────────────────────────────────

    [HttpPost("state-groups")]
    public async Task<ActionResult<StateGroupDto>> CreateStateGroup(
        [FromBody] CreateStateGroupDto dto, CancellationToken ct)
    {
        var group = await stateGroupService.CreateAsync(dto, ct);
        return CreatedAtAction(nameof(CreateStateGroup), new { id = group.Id }, group);
    }

    [HttpPatch("state-groups/{id:guid}")]
    public async Task<ActionResult<StateGroupDto>> UpdateStateGroup(
        Guid id, [FromBody] UpdateStateGroupDto dto, CancellationToken ct)
    {
        var group = await stateGroupService.UpdateAsync(id, dto, ct);
        return Ok(group);
    }

    [HttpDelete("state-groups/{id:guid}")]
    public async Task<IActionResult> DeleteStateGroup(Guid id, CancellationToken ct)
    {
        await stateGroupService.DeleteAsync(id, ct);
        return NoContent();
    }

}
