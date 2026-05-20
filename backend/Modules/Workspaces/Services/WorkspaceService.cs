using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Common.Email;
using TaskManager.Api.Common.Exceptions;
using TaskManager.Api.Common.Pagination;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Workspaces.Dtos;
using TaskManager.Api.Modules.Workspaces.Entities;

namespace TaskManager.Api.Modules.Workspaces.Services;

public class WorkspaceService(AppDbContext db, IMapper mapper, IEmailService emailService, IConfiguration configuration)
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

        member.Role = dto.Role;
        await db.SaveChangesAsync(ct);
        return mapper.Map<WorkspaceMemberDto>(member);
    }

    public async Task<WorkspaceInvitationDto> InviteMemberAsync(string slug, CreateWorkspaceInvitationDto dto, Guid invitedById, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == slug, ct)
            ?? throw new NotFoundException($"Workspace '{slug}' not found.");

        var isRequesterAdmin = await db.WorkspaceMembers
            .AnyAsync(m => m.WorkspaceId == workspace.Id && m.UserId == invitedById && m.Role == WorkspaceRole.Admin, ct);

        if (workspace.OwnerId != invitedById && !isRequesterAdmin)
            throw new ForbiddenException("Only workspace admins can invite members.");

        var normalizedEmail = dto.Email.ToLowerInvariant();

        var alreadyMember = await db.WorkspaceMembers
            .Include(m => m.User)
            .AnyAsync(m => m.WorkspaceId == workspace.Id && m.User.Email == normalizedEmail, ct);

        if (alreadyMember)
            throw new ValidationException($"User '{dto.Email}' is already a member of this workspace.");

        var invitation = new WorkspaceInvitation
        {
            WorkspaceId = workspace.Id,
            Email = normalizedEmail,
            Token = Guid.NewGuid().ToString("N"),
            Role = dto.Role,
            InvitedById = invitedById,
            ExpiresAt = DateTime.UtcNow.AddDays(7)
        };

        db.WorkspaceInvitations.Add(invitation);
        await db.SaveChangesAsync(ct);

        var frontendUrl = configuration["App:FrontendUrl"] ?? "http://localhost:5173";
        var inviteLink = $"{frontendUrl}/invitations/workspace/{invitation.Token}";
        await emailService.SendWorkspaceInvitationAsync(normalizedEmail, string.Empty, workspace.Name, inviteLink, ct);

        return mapper.Map<WorkspaceInvitationDto>(invitation);
    }

    public async Task AcceptInvitationAsync(string token, Guid userId, CancellationToken ct = default)
    {
        var invitation = await db.WorkspaceInvitations
            .FirstOrDefaultAsync(i => i.Token == token && i.AcceptedAt == null && i.ExpiresAt > DateTime.UtcNow, ct)
            ?? throw new NotFoundException("Invitation not found, already accepted, or expired.");

        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == userId, ct)
            ?? throw new NotFoundException("User not found.");

        if (!string.Equals(user.Email, invitation.Email, StringComparison.OrdinalIgnoreCase))
            throw new ValidationException("This invitation was sent to a different email address.");

        var alreadyMember = await db.WorkspaceMembers
            .AnyAsync(m => m.WorkspaceId == invitation.WorkspaceId && m.UserId == userId, ct);

        if (alreadyMember)
            throw new ValidationException("You are already a member of this workspace.");

        db.WorkspaceMembers.Add(new WorkspaceMember
        {
            WorkspaceId = invitation.WorkspaceId,
            UserId = userId,
            Role = invitation.Role,
            IsActive = true
        });

        invitation.AcceptedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
    }

    public async Task<IEnumerable<WorkspaceInvitationDto>> GetPendingInvitationsAsync(string slug, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.AsNoTracking()
            .FirstOrDefaultAsync(w => w.Slug == slug, ct)
            ?? throw new NotFoundException($"Workspace '{slug}' not found.");

        var invitations = await db.WorkspaceInvitations
            .AsNoTracking()
            .Where(i => i.WorkspaceId == workspace.Id && i.AcceptedAt == null && i.ExpiresAt > DateTime.UtcNow)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync(ct);

        return mapper.Map<IEnumerable<WorkspaceInvitationDto>>(invitations);
    }

    public async Task RevokeInvitationAsync(Guid invitationId, Guid requesterId, CancellationToken ct = default)
    {
        var invitation = await db.WorkspaceInvitations
            .Include(i => i.Workspace)
            .FirstOrDefaultAsync(i => i.Id == invitationId, ct)
            ?? throw new NotFoundException("Invitation not found.");

        var isRequesterAdmin = await db.WorkspaceMembers
            .AnyAsync(m => m.WorkspaceId == invitation.WorkspaceId && m.UserId == requesterId && m.Role == WorkspaceRole.Admin, ct);

        if (invitation.Workspace.OwnerId != requesterId && !isRequesterAdmin)
            throw new ForbiddenException("Only workspace admins can revoke invitations.");

        invitation.IsDeleted = true;
        invitation.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
    }
}
