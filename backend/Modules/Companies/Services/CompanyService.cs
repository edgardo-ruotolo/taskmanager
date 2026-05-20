using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Common.Email;
using TaskManager.Api.Common.Exceptions;
using TaskManager.Api.Common.Pagination;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Companies.Dtos;
using TaskManager.Api.Modules.Companies.Entities;

namespace TaskManager.Api.Modules.Companies.Services;

public class CompanyService(AppDbContext db, IMapper mapper, IEmailService emailService, IConfiguration configuration)
    : ICompanyService
{
    public async Task<CompanyDto> CreateAsync(string workspaceSlug, Guid userId, CreateCompanyDto dto, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var identifierExists = await db.Companies.AnyAsync(c => c.WorkspaceId == workspace.Id && c.Identifier == dto.Identifier, ct);
        if (identifierExists)
            throw new ValidationException($"Identifier '{dto.Identifier}' already exists in this workspace.");

        var defaultStateGroup = await db.StateGroups.IgnoreQueryFilters()
            .FirstOrDefaultAsync(g => g.IsDefault, ct)
            ?? throw new NotFoundException("No default state group found. Run the state seeder first.");

        var company = mapper.Map<Company>(dto);
        company.WorkspaceId = workspace.Id;
        company.OwnerId = userId;
        company.StateGroupId = defaultStateGroup.Id;
        db.Companies.Add(company);

        db.CompanyMembers.Add(new CompanyMember
        {
            CompanyId = company.Id,
            UserId = userId,
            Role = CompanyRole.Admin
        });

        await db.SaveChangesAsync(ct);
        return mapper.Map<CompanyDto>(company);
    }

    public async Task<PagedResult<CompanyDto>> GetAllAsync(string workspaceSlug, int page, int pageSize, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.AsNoTracking()
            .FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var query = db.Companies.AsNoTracking().Where(c => c.WorkspaceId == workspace.Id);
        var total = await query.CountAsync(ct);
        var items = await query.OrderBy(c => c.Name).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);

        return new PagedResult<CompanyDto>
        {
            Items = mapper.Map<IEnumerable<CompanyDto>>(items),
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<CompanyDto> GetByIdAsync(string workspaceSlug, Guid companyId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.AsNoTracking()
            .FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var company = await db.Companies.AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == companyId && c.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Company not found.");

        return mapper.Map<CompanyDto>(company);
    }

    public async Task DeleteAsync(string workspaceSlug, Guid companyId, Guid userId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var company = await db.Companies.FirstOrDefaultAsync(c => c.Id == companyId && c.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Company not found.");

        if (company.OwnerId != userId)
            throw new ForbiddenException("Only the company owner can delete it.");

        company.IsDeleted = true;
        company.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
    }

    public async Task<CompanyDto> UpdateAsync(string workspaceSlug, Guid companyId, Guid userId, UpdateCompanyDto dto, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var company = await db.Companies.FirstOrDefaultAsync(c => c.Id == companyId && c.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Company not found.");

        var isMemberAdmin = await db.CompanyMembers
            .AnyAsync(m => m.CompanyId == companyId && m.UserId == userId && m.Role == CompanyRole.Admin, ct);

        if (company.OwnerId != userId && !isMemberAdmin)
            throw new ForbiddenException("Only company admins can update it.");

        if (dto.Name != null) company.Name = dto.Name;
        if (dto.Description != null) company.Description = dto.Description;
        if (dto.LogoUrl != null) company.LogoUrl = dto.LogoUrl;

        await db.SaveChangesAsync(ct);
        return mapper.Map<CompanyDto>(company);
    }

    public async Task<IEnumerable<CompanyMemberDto>> GetMembersAsync(string workspaceSlug, Guid companyId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.AsNoTracking()
            .FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var company = await db.Companies.AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == companyId && c.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Company not found.");

        var members = await db.CompanyMembers
            .AsNoTracking()
            .Include(m => m.User)
            .Where(m => m.CompanyId == company.Id)
            .OrderBy(m => m.User.Email)
            .ToListAsync(ct);

        return mapper.Map<IEnumerable<CompanyMemberDto>>(members);
    }

    public async Task RemoveMemberAsync(string workspaceSlug, Guid companyId, Guid userId, Guid requesterId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var company = await db.Companies.FirstOrDefaultAsync(c => c.Id == companyId && c.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Company not found.");

        var isRequesterAdmin = await db.CompanyMembers
            .AnyAsync(m => m.CompanyId == companyId && m.UserId == requesterId && m.Role == CompanyRole.Admin, ct);

        if (company.OwnerId != requesterId && !isRequesterAdmin)
            throw new ForbiddenException("Only company admins can remove members.");

        if (company.OwnerId == userId)
            throw new ValidationException("Cannot remove the company owner.");

        var member = await db.CompanyMembers
            .FirstOrDefaultAsync(m => m.CompanyId == companyId && m.UserId == userId, ct)
            ?? throw new NotFoundException("Member not found in this company.");

        member.IsDeleted = true;
        member.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
    }

    public async Task<CompanyMemberDto> UpdateMemberRoleAsync(string workspaceSlug, Guid companyId, Guid userId, UpdateCompanyMemberRoleDto dto, Guid requesterId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var company = await db.Companies.FirstOrDefaultAsync(c => c.Id == companyId && c.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Company not found.");

        var isRequesterAdmin = await db.CompanyMembers
            .AnyAsync(m => m.CompanyId == companyId && m.UserId == requesterId && m.Role == CompanyRole.Admin, ct);

        if (company.OwnerId != requesterId && !isRequesterAdmin)
            throw new ForbiddenException("Only company admins can change member roles.");

        if (company.OwnerId == userId)
            throw new ValidationException("Cannot change the role of the company owner.");

        var member = await db.CompanyMembers
            .Include(m => m.User)
            .FirstOrDefaultAsync(m => m.CompanyId == companyId && m.UserId == userId, ct)
            ?? throw new NotFoundException("Member not found in this company.");

        if (member.Role == CompanyRole.Admin && dto.Role != CompanyRole.Admin)
        {
            var otherAdmins = await db.CompanyMembers
                .CountAsync(m => m.CompanyId == companyId && m.UserId != userId && m.Role == CompanyRole.Admin, ct);
            if (otherAdmins == 0)
                throw new ValidationException("La empresa debe tener al menos un Administrador.");
        }

        member.Role = dto.Role;
        await db.SaveChangesAsync(ct);
        return mapper.Map<CompanyMemberDto>(member);
    }

    public async Task<CompanyInvitationDto> InviteMemberAsync(string workspaceSlug, Guid companyId, CreateCompanyInvitationDto dto, Guid invitedById, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var company = await db.Companies.FirstOrDefaultAsync(c => c.Id == companyId && c.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Company not found.");

        var isRequesterAdmin = await db.CompanyMembers
            .AnyAsync(m => m.CompanyId == companyId && m.UserId == invitedById && m.Role == CompanyRole.Admin, ct);

        if (company.OwnerId != invitedById && !isRequesterAdmin)
            throw new ForbiddenException("Only company admins can invite members.");

        var normalizedEmail = dto.Email.ToLowerInvariant();

        var alreadyMember = await db.CompanyMembers
            .Include(m => m.User)
            .AnyAsync(m => m.CompanyId == companyId && m.User.Email == normalizedEmail, ct);

        if (alreadyMember)
            throw new ValidationException($"User '{dto.Email}' is already a member of this company.");

        var invitation = new CompanyInvitation
        {
            CompanyId = companyId,
            Email = normalizedEmail,
            Token = Guid.NewGuid().ToString("N"),
            Role = dto.Role,
            InvitedById = invitedById,
            ExpiresAt = DateTime.UtcNow.AddDays(7)
        };

        db.CompanyInvitations.Add(invitation);
        await db.SaveChangesAsync(ct);

        var frontendUrl = configuration["App:FrontendUrl"] ?? "http://localhost:5173";
        var inviteLink = $"{frontendUrl}/invitations/company/{invitation.Token}";
        await emailService.SendCompanyInvitationAsync(normalizedEmail, company.Name, inviteLink, ct);

        return mapper.Map<CompanyInvitationDto>(invitation);
    }

    public async Task AcceptInvitationAsync(string token, Guid userId, CancellationToken ct = default)
    {
        var invitation = await db.CompanyInvitations
            .FirstOrDefaultAsync(i => i.Token == token && i.AcceptedAt == null && i.ExpiresAt > DateTime.UtcNow, ct)
            ?? throw new NotFoundException("Invitation not found, already accepted, or expired.");

        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == userId, ct)
            ?? throw new NotFoundException("User not found.");

        if (!string.Equals(user.Email, invitation.Email, StringComparison.OrdinalIgnoreCase))
            throw new ValidationException("This invitation was sent to a different email address.");

        var alreadyMember = await db.CompanyMembers
            .AnyAsync(m => m.CompanyId == invitation.CompanyId && m.UserId == userId, ct);

        if (alreadyMember)
            throw new ValidationException("You are already a member of this company.");

        db.CompanyMembers.Add(new CompanyMember
        {
            CompanyId = invitation.CompanyId,
            UserId = userId,
            Role = invitation.Role
        });

        invitation.AcceptedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
    }

    public async Task<IEnumerable<CompanyInvitationDto>> GetPendingInvitationsAsync(string workspaceSlug, Guid companyId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.AsNoTracking()
            .FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var company = await db.Companies.AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == companyId && c.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Company not found.");

        var invitations = await db.CompanyInvitations
            .AsNoTracking()
            .Where(i => i.CompanyId == company.Id && i.AcceptedAt == null && i.ExpiresAt > DateTime.UtcNow)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync(ct);

        return mapper.Map<IEnumerable<CompanyInvitationDto>>(invitations);
    }

    public async Task RevokeInvitationAsync(Guid invitationId, Guid requesterId, CancellationToken ct = default)
    {
        var invitation = await db.CompanyInvitations
            .Include(i => i.Company)
            .FirstOrDefaultAsync(i => i.Id == invitationId, ct)
            ?? throw new NotFoundException("Invitation not found.");

        var isRequesterAdmin = await db.CompanyMembers
            .AnyAsync(m => m.CompanyId == invitation.CompanyId && m.UserId == requesterId && m.Role == CompanyRole.Admin, ct);

        if (invitation.Company.OwnerId != requesterId && !isRequesterAdmin)
            throw new ForbiddenException("Only company admins can revoke invitations.");

        invitation.IsDeleted = true;
        invitation.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
    }
}
