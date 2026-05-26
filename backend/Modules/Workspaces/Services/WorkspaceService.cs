using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Common.Exceptions;
using TaskManager.Api.Common.Pagination;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Auth.Entities;
using TaskManager.Api.Modules.Workspaces.Dtos;
using TaskManager.Api.Modules.Workspaces.Entities;

namespace TaskManager.Api.Modules.Workspaces.Services;

public class WorkspaceService(AppDbContext db, IMapper mapper, UserManager<User> userManager)
    : IWorkspaceService
{
    public async Task<WorkspaceDto> CreateAsync(Guid userId, CreateWorkspaceDto dto, CancellationToken ct = default)
    {
        var slugExists = await db.Workspaces.AnyAsync(w => w.Slug == dto.Slug, ct);
        if (slugExists)
            throw new ValidationException($"Slug '{dto.Slug}' is already taken.");

        var workspace = mapper.Map<Workspace>(dto);
        workspace.OwnerId = userId;
        db.Workspaces.Add(workspace);

        db.WorkspaceMembers.Add(new WorkspaceMember
        {
            WorkspaceId = workspace.Id,
            UserId = userId,
            Role = WorkspaceRole.Admin
        });

        // Marcar onboarding como completado cuando es el primer workspace del usuario
        var creator = await db.Users.FindAsync(new object[] { userId }, ct);
        if (creator is not null && creator.OnboardingCompletedAt is null)
        {
            creator.OnboardingCompletedAt = DateTime.UtcNow;
        }

        await db.SaveChangesAsync(ct);
        return mapper.Map<WorkspaceDto>(workspace);
    }

    public async Task<PagedResult<WorkspaceDto>> GetUserWorkspacesAsync(Guid userId, int page, int pageSize, CancellationToken ct = default)
    {
        var query = db.Workspaces
            .AsNoTracking()
            .Where(w => w.Members.Any(m => m.UserId == userId && m.IsActive));

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderBy(w => w.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return new PagedResult<WorkspaceDto>
        {
            Items = mapper.Map<IEnumerable<WorkspaceDto>>(items),
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<WorkspaceDto> GetBySlugAsync(string slug, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.AsNoTracking()
            .FirstOrDefaultAsync(w => w.Slug == slug, ct)
            ?? throw new NotFoundException($"Workspace '{slug}' not found.");
        return mapper.Map<WorkspaceDto>(workspace);
    }

    public async Task DeleteAsync(string slug, Guid userId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == slug, ct)
            ?? throw new NotFoundException($"Workspace '{slug}' not found.");

        if (workspace.OwnerId != userId)
            throw new ForbiddenException("Only the workspace owner can delete it.");

        workspace.IsDeleted = true;
        workspace.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
    }

    public async Task<WorkspaceDto> UpdateAsync(string slug, Guid userId, UpdateWorkspaceDto dto, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == slug, ct)
            ?? throw new NotFoundException($"Workspace '{slug}' not found.");

        var isMemberAdmin = await db.WorkspaceMembers
            .AnyAsync(m => m.WorkspaceId == workspace.Id && m.UserId == userId && m.Role == WorkspaceRole.Admin, ct);

        if (workspace.OwnerId != userId && !isMemberAdmin)
            throw new ForbiddenException("Only workspace admins can update it.");

        if (dto.Name != null) workspace.Name = dto.Name;
        if (dto.Description != null) workspace.Description = dto.Description;
        if (dto.LogoUrl != null) workspace.LogoUrl = dto.LogoUrl;

        await db.SaveChangesAsync(ct);
        return mapper.Map<WorkspaceDto>(workspace);
    }

    public async Task<IEnumerable<WorkspaceMemberDto>> GetMembersAsync(string slug, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.AsNoTracking()
            .FirstOrDefaultAsync(w => w.Slug == slug, ct)
            ?? throw new NotFoundException($"Workspace '{slug}' not found.");

        var members = await db.WorkspaceMembers
            .AsNoTracking()
            .Include(m => m.User)
            .Where(m => m.WorkspaceId == workspace.Id)
            .OrderBy(m => m.User.Email)
            .ToListAsync(ct);

        return mapper.Map<IEnumerable<WorkspaceMemberDto>>(members);
    }

    public async Task RemoveMemberAsync(string slug, Guid userId, Guid requesterId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == slug, ct)
            ?? throw new NotFoundException($"Workspace '{slug}' not found.");

        var isRequesterAdmin = await db.WorkspaceMembers
            .AnyAsync(m => m.WorkspaceId == workspace.Id && m.UserId == requesterId && m.Role == WorkspaceRole.Admin, ct);

        if (workspace.OwnerId != requesterId && !isRequesterAdmin)
            throw new ForbiddenException("Only workspace admins can remove members.");

        if (workspace.OwnerId == userId)
            throw new ValidationException("Cannot remove the workspace owner.");

        var member = await db.WorkspaceMembers
            .FirstOrDefaultAsync(m => m.WorkspaceId == workspace.Id && m.UserId == userId, ct)
            ?? throw new NotFoundException("Member not found in this workspace.");

        if (member.Role == WorkspaceRole.Admin)
        {
            var adminCount = await db.WorkspaceMembers
                .CountAsync(m => m.WorkspaceId == workspace.Id && m.Role == WorkspaceRole.Admin, ct);
            if (adminCount <= 1)
                throw new ValidationException("Cannot remove the last admin of the workspace.");
        }

        member.IsDeleted = true;
        member.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
    }

    public async Task<WorkspaceMemberDto> UpdateMemberRoleAsync(string slug, Guid userId, UpdateMemberRoleDto dto, Guid requesterId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == slug, ct)
            ?? throw new NotFoundException($"Workspace '{slug}' not found.");

        var isRequesterAdmin = await db.WorkspaceMembers
            .AnyAsync(m => m.WorkspaceId == workspace.Id && m.UserId == requesterId && m.Role == WorkspaceRole.Admin, ct);

        if (workspace.OwnerId != requesterId && !isRequesterAdmin)
            throw new ForbiddenException("Only workspace admins can change member roles.");

        if (workspace.OwnerId == userId)
            throw new ValidationException("Cannot change the role of the workspace owner.");

        var member = await db.WorkspaceMembers
            .Include(m => m.User)
            .FirstOrDefaultAsync(m => m.WorkspaceId == workspace.Id && m.UserId == userId, ct)
            ?? throw new NotFoundException("Member not found in this workspace.");

        if (member.Role == WorkspaceRole.Admin && dto.Role != WorkspaceRole.Admin)
        {
            var adminCount = await db.WorkspaceMembers
                .CountAsync(m => m.WorkspaceId == workspace.Id && m.Role == WorkspaceRole.Admin, ct);
            if (adminCount <= 1)
                throw new ValidationException("Cannot demote the last admin of the workspace.");
        }

        member.Role = dto.Role;
        await db.SaveChangesAsync(ct);
        return mapper.Map<WorkspaceMemberDto>(member);
    }

    public async Task<IEnumerable<WorkspaceUserSearchDto>> SearchUsersAsync(string slug, string query, int limit, Guid requesterId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.AsNoTracking()
            .FirstOrDefaultAsync(w => w.Slug == slug, ct)
            ?? throw new NotFoundException($"Workspace '{slug}' not found.");

        await EnsureRequesterIsAdminAsync(workspace.Id, workspace.OwnerId, requesterId, ct);

        var safeLimit = limit <= 0 ? 10 : Math.Min(limit, 50);
        var existingMemberIds = await db.WorkspaceMembers
            .Where(m => m.WorkspaceId == workspace.Id)
            .Select(m => m.UserId)
            .ToListAsync(ct);

        var usersQuery = db.Users.AsNoTracking()
            .Where(u => u.IsActive && !existingMemberIds.Contains(u.Id));

        if (!string.IsNullOrWhiteSpace(query))
        {
            var q = query.Trim().ToLower();
            usersQuery = usersQuery.Where(u =>
                (u.Email != null && u.Email.ToLower().Contains(q)) ||
                (u.DisplayName != null && u.DisplayName.ToLower().Contains(q)));
        }

        var users = await usersQuery
            .OrderBy(u => u.Email)
            .Take(safeLimit)
            .Select(u => new WorkspaceUserSearchDto
            {
                UserId = u.Id,
                Email = u.Email ?? string.Empty,
                DisplayName = u.DisplayName,
                AvatarUrl = u.AvatarUrl
            })
            .ToListAsync(ct);

        return users;
    }

    public async Task<WorkspaceMemberDto> AddMemberAsync(string slug, AddWorkspaceMemberDto dto, Guid requesterId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == slug, ct)
            ?? throw new NotFoundException($"Workspace '{slug}' not found.");

        await EnsureRequesterIsAdminAsync(workspace.Id, workspace.OwnerId, requesterId, ct);

        var userExists = await db.Users.AnyAsync(u => u.Id == dto.UserId && u.IsActive, ct);
        if (!userExists)
            throw new NotFoundException($"User '{dto.UserId}' not found.");

        var alreadyMember = await db.WorkspaceMembers
            .AnyAsync(m => m.WorkspaceId == workspace.Id && m.UserId == dto.UserId, ct);
        if (alreadyMember)
            throw new ValidationException("User is already a member of this workspace.");

        var member = new WorkspaceMember
        {
            WorkspaceId = workspace.Id,
            UserId = dto.UserId,
            Role = dto.Role,
            IsActive = true
        };

        db.WorkspaceMembers.Add(member);
        await db.SaveChangesAsync(ct);

        var saved = await db.WorkspaceMembers
            .AsNoTracking()
            .Include(m => m.User)
            .FirstAsync(m => m.Id == member.Id, ct);

        return mapper.Map<WorkspaceMemberDto>(saved);
    }

    public async Task<WorkspaceMemberDto> CreateUserAndAddMemberAsync(string slug, CreateUserAndAddMemberDto dto, Guid requesterId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == slug, ct)
            ?? throw new NotFoundException($"Workspace '{slug}' not found.");

        await EnsureRequesterIsAdminAsync(workspace.Id, workspace.OwnerId, requesterId, ct);

        var normalizedEmail = dto.Email.Trim().ToLowerInvariant();
        var existingUser = await userManager.FindByEmailAsync(normalizedEmail);
        if (existingUser is not null)
            throw new ValidationException($"A user with email '{dto.Email}' already exists. Use the search flow to add an existing user.");

        var user = new User
        {
            UserName = normalizedEmail,
            Email = normalizedEmail,
            FirstName = dto.FirstName.Trim(),
            LastName = dto.LastName.Trim(),
            DisplayName = $"{dto.FirstName.Trim()} {dto.LastName.Trim()}",
            IsActive = true,
            EmailConfirmed = true
        };

        var createResult = await userManager.CreateAsync(user, dto.Password);
        if (!createResult.Succeeded)
        {
            var errors = string.Join(", ", createResult.Errors.Select(e => e.Description));
            throw new ValidationException($"Failed to create user: {errors}");
        }

        var member = new WorkspaceMember
        {
            WorkspaceId = workspace.Id,
            UserId = user.Id,
            Role = dto.Role,
            IsActive = true
        };

        db.WorkspaceMembers.Add(member);
        await db.SaveChangesAsync(ct);

        var saved = await db.WorkspaceMembers
            .AsNoTracking()
            .Include(m => m.User)
            .FirstAsync(m => m.Id == member.Id, ct);

        return mapper.Map<WorkspaceMemberDto>(saved);
    }

    private async Task EnsureRequesterIsAdminAsync(Guid workspaceId, Guid ownerId, Guid requesterId, CancellationToken ct)
    {
        if (ownerId == requesterId) return;

        var isAdmin = await db.WorkspaceMembers
            .AnyAsync(m => m.WorkspaceId == workspaceId && m.UserId == requesterId && m.Role == WorkspaceRole.Admin, ct);
        if (!isAdmin)
            throw new ForbiddenException("Only workspace admins can perform this action.");
    }
}
