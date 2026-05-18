using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Common.Pagination;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Admin.Dtos;
using TaskManager.Api.Modules.Admin.Services;
using TaskManager.Api.Modules.Auth.Entities;
using TaskManager.Api.Modules.Companies.Entities;
using TaskManager.Api.Modules.States.Dtos;
using TaskManager.Api.Modules.States.Services;
using TaskManager.Api.Modules.Workspaces.Dtos;

namespace TaskManager.Api.Modules.Admin.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController(
    IInstanceConfigService configService,
    AppDbContext db,
    UserManager<User> userManager,
    IStateGroupService stateGroupService) : ControllerBase
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

        var validRoles = new[] { "Admin", "Member" };
        var role = validRoles.Contains(dto.Role) ? dto.Role : "Member";
        await userManager.AddToRoleAsync(user, role);

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
            var validRoles = new[] { "Admin", "Member" };
            var newRole = validRoles.Contains(dto.Role) ? dto.Role : "Member";
            await userManager.AddToRoleAsync(user, newRole);
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

    [HttpGet("companies")]
    public async Task<ActionResult<PagedResult<AdminCompanyDto>>> GetCompanies(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var query = db.Companies
            .Include(c => c.Workspace)
            .Include(c => c.Members)
            .Include(c => c.StateGroup)
            .OrderBy(c => c.Name);

        var total = await query.CountAsync(ct);
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new AdminCompanyDto
            {
                Id = c.Id,
                Name = c.Name,
                Identifier = c.Identifier,
                Description = c.Description,
                WorkspaceId = c.WorkspaceId,
                WorkspaceName = c.Workspace.Name,
                OwnerId = c.OwnerId,
                MemberCount = c.Members.Count,
                CreatedAt = c.CreatedAt,
                StateGroupId = c.StateGroupId,
                StateGroupName = c.StateGroup.Name
            })
            .ToListAsync(ct);

        return Ok(new PagedResult<AdminCompanyDto>
        {
            Items = items,
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        });
    }

    [HttpGet("companies/{companyId:guid}/members")]
    public async Task<ActionResult<List<AdminCompanyMemberDto>>> GetCompanyMembers(
        Guid companyId,
        CancellationToken ct)
    {
        var members = await db.CompanyMembers
            .Where(m => m.CompanyId == companyId)
            .Include(m => m.User)
            .Select(m => new AdminCompanyMemberDto
            {
                UserId = m.UserId,
                Email = m.User.Email ?? string.Empty,
                DisplayName = m.User.DisplayName ?? m.User.UserName,
                Role = m.Role.ToString()
            })
            .ToListAsync(ct);

        return Ok(members);
    }

    [HttpPost("companies/{companyId:guid}/members")]
    public async Task<ActionResult<AdminCompanyMemberDto>> AddCompanyMember(
        Guid companyId,
        [FromBody] AdminAddCompanyMemberDto dto,
        CancellationToken ct)
    {
        var company = await db.Companies.FindAsync([companyId], ct);
        if (company is null) return NotFound(new { error = "Empresa no encontrada" });

        var user = await userManager.FindByIdAsync(dto.UserId.ToString());
        if (user is null) return NotFound(new { error = "Usuario no encontrado" });

        var exists = await db.CompanyMembers.AnyAsync(
            m => m.CompanyId == companyId && m.UserId == dto.UserId, ct);
        if (exists) return Conflict(new { error = "El usuario ya es miembro de esta empresa" });

        var validRoles = new[] { "Guest", "Member", "Admin" };
        var roleName = validRoles.Contains(dto.Role) ? dto.Role : "Member";
        var role = Enum.Parse<CompanyRole>(roleName);

        var member = new CompanyMember
        {
            CompanyId = companyId,
            UserId = dto.UserId,
            Role = role
        };

        db.CompanyMembers.Add(member);
        await db.SaveChangesAsync(ct);

        return Ok(new AdminCompanyMemberDto
        {
            UserId = user.Id,
            Email = user.Email ?? string.Empty,
            DisplayName = user.DisplayName ?? user.UserName,
            Role = role.ToString()
        });
    }

    [HttpDelete("companies/{companyId:guid}/members/{userId:guid}")]
    public async Task<IActionResult> RemoveCompanyMember(
        Guid companyId,
        Guid userId,
        CancellationToken ct)
    {
        var member = await db.CompanyMembers
            .FirstOrDefaultAsync(m => m.CompanyId == companyId && m.UserId == userId, ct);

        if (member is null) return NotFound();

        db.CompanyMembers.Remove(member);
        await db.SaveChangesAsync(ct);

        return NoContent();
    }

    // ─── State Groups ────────────────────────────────────────────────

    [HttpGet("state-groups")]
    public async Task<ActionResult<IEnumerable<StateGroupDto>>> GetStateGroups(CancellationToken ct)
    {
        var groups = await stateGroupService.GetAllAsync(ct);
        return Ok(groups);
    }

    [HttpGet("state-groups/{id:guid}")]
    public async Task<ActionResult<StateGroupDto>> GetStateGroup(Guid id, CancellationToken ct)
    {
        var group = await stateGroupService.GetByIdAsync(id, ct);
        return Ok(group);
    }

    [HttpPost("state-groups")]
    public async Task<ActionResult<StateGroupDto>> CreateStateGroup(
        [FromBody] CreateStateGroupDto dto, CancellationToken ct)
    {
        var group = await stateGroupService.CreateAsync(dto, ct);
        return CreatedAtAction(nameof(GetStateGroup), new { id = group.Id }, group);
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

    // ─── Company update (with state group reassignment) ──────────────

    [HttpPatch("companies/{companyId:guid}")]
    public async Task<ActionResult<AdminCompanyDto>> UpdateCompany(
        Guid companyId,
        [FromBody] UpdateAdminCompanyDto dto,
        CancellationToken ct)
    {
        var company = await db.Companies
            .Include(c => c.StateGroup)
            .Include(c => c.Workspace)
            .FirstOrDefaultAsync(c => c.Id == companyId, ct);
        if (company is null) return NotFound(new { error = "Empresa no encontrada" });

        if (dto.Name is not null) company.Name = dto.Name;
        if (dto.Description is not null) company.Description = dto.Description;

        if (dto.StateGroupId.HasValue && dto.StateGroupId.Value != company.StateGroupId)
        {
            var newGroup = await db.StateGroups
                .Include(g => g.States)
                .FirstOrDefaultAsync(g => g.Id == dto.StateGroupId.Value, ct);
            if (newGroup is null)
                return BadRequest(new { error = "Grupo de estados no encontrado" });

            var defaultState = newGroup.States.FirstOrDefault(s => s.IsDefault && !s.IsDeleted);
            if (defaultState is null)
                return BadRequest(new { error = "El nuevo grupo no tiene un estado por defecto definido" });

            await db.Issues
                .Where(i => i.CompanyId == companyId)
                .ExecuteUpdateAsync(s => s.SetProperty(i => i.StateId, defaultState.Id), ct);

            company.StateGroupId = dto.StateGroupId.Value;
            company.StateGroup = newGroup;
        }

        await db.SaveChangesAsync(ct);

        return Ok(new AdminCompanyDto
        {
            Id = company.Id,
            Name = company.Name,
            Identifier = company.Identifier,
            Description = company.Description,
            WorkspaceId = company.WorkspaceId,
            WorkspaceName = company.Workspace?.Name ?? string.Empty,
            OwnerId = company.OwnerId,
            MemberCount = await db.CompanyMembers.CountAsync(m => m.CompanyId == companyId, ct),
            CreatedAt = company.CreatedAt,
            StateGroupId = company.StateGroupId,
            StateGroupName = company.StateGroup?.Name ?? string.Empty
        });
    }
}
