using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Common.Email;
using TaskManager.Api.Common.Exceptions;
using TaskManager.Api.Common.Pagination;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Projects.Dtos;
using TaskManager.Api.Modules.Projects.Entities;
using TaskManager.Api.Modules.States.Entities;

namespace TaskManager.Api.Modules.Projects.Services;

public class ProjectService(AppDbContext db, IMapper mapper, IEmailService emailService, IConfiguration configuration)
    : IProjectService
{
    public async Task<ProjectDto> CreateAsync(string workspaceSlug, Guid userId, CreateProjectDto dto, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var identifierExists = await db.Projects.AnyAsync(c => c.WorkspaceId == workspace.Id && c.Identifier == dto.Identifier, ct);
        if (identifierExists)
            throw new ValidationException($"Identifier '{dto.Identifier}' already exists in this workspace.");

        var defaultStateGroup = await db.StateGroups.IgnoreQueryFilters()
            .FirstOrDefaultAsync(g => g.IsDefault, ct)
            ?? throw new NotFoundException("No default state group found. Run the state seeder first.");

        if (dto.TeamId.HasValue)
        {
            var teamBelongsToWorkspace = await db.Teams
                .AnyAsync(t => t.Id == dto.TeamId.Value && t.WorkspaceId == workspace.Id, ct);
            if (!teamBelongsToWorkspace)
                throw new ValidationException("The selected team does not belong to this workspace.");
        }

        var project = mapper.Map<Project>(dto);
        project.WorkspaceId = workspace.Id;
        project.OwnerId = userId;
        project.StateGroupId = defaultStateGroup.Id;
        project.StateGroup = defaultStateGroup;
        project.TeamId = dto.TeamId;
        db.Projects.Add(project);

        db.ProjectMembers.Add(new ProjectMember
        {
            ProjectId = project.Id,
            UserId = userId,
            Role = ProjectRole.Admin
        });

        await db.SaveChangesAsync(ct);

        var result = mapper.Map<ProjectDto>(project);
        await EnrichProjectsAsync(new[] { result }, ct);
        return result;
    }

    public async Task<PagedResult<ProjectDto>> GetAllAsync(string workspaceSlug, int page, int pageSize, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.AsNoTracking()
            .FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var query = db.Projects.AsNoTracking().Include(c => c.StateGroup).Include(c => c.Team).Where(c => c.WorkspaceId == workspace.Id);
        var total = await query.CountAsync(ct);
        var items = await query.OrderBy(c => c.Name).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);

        var dtos = mapper.Map<List<ProjectDto>>(items);
        await EnrichProjectsAsync(dtos, ct);

        return new PagedResult<ProjectDto>
        {
            Items = dtos,
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        };
    }

    private async Task EnrichProjectsAsync(IReadOnlyList<ProjectDto> projects, CancellationToken ct)
    {
        if (projects.Count == 0) return;

        var projectIds = projects.Select(p => p.Id).ToList();

        var issueStats = await db.Issues
            .AsNoTracking()
            .Where(i => projectIds.Contains(i.ProjectId))
            .GroupBy(i => i.ProjectId)
            .Select(g => new
            {
                ProjectId = g.Key,
                Total = g.Count(),
                Completed = g.Count(i => i.State.Category == StateCategory.Completed
                                          || i.State.Category == StateCategory.Cancelled)
            })
            .ToListAsync(ct);

        var membersRaw = await db.ProjectMembers
            .AsNoTracking()
            .Include(m => m.User)
            .Where(m => projectIds.Contains(m.ProjectId))
            .OrderBy(m => m.CreatedAt)
            .ToListAsync(ct);

        var membersByProject = membersRaw
            .GroupBy(m => m.ProjectId)
            .ToDictionary(g => g.Key, g => g.Take(6).Select(MapMemberSummary).ToList());

        foreach (var p in projects)
        {
            var stats = issueStats.FirstOrDefault(s => s.ProjectId == p.Id);
            p.TotalIssues = stats?.Total ?? 0;
            p.CompletedIssues = stats?.Completed ?? 0;
            p.Members = membersByProject.TryGetValue(p.Id, out var members) ? members : [];
        }
    }

    private static ProjectMemberSummaryDto MapMemberSummary(ProjectMember member)
    {
        var user = member.User;
        var displayName = !string.IsNullOrWhiteSpace(user.DisplayName)
            ? user.DisplayName!
            : $"{user.FirstName} {user.LastName}".Trim();
        if (string.IsNullOrWhiteSpace(displayName))
            displayName = user.UserName ?? user.Email ?? string.Empty;

        return new ProjectMemberSummaryDto
        {
            UserId = user.Id,
            DisplayName = displayName,
            Initials = BuildInitials(displayName),
            AvatarUrl = user.AvatarUrl
        };
    }

    private static string BuildInitials(string name)
    {
        if (string.IsNullOrWhiteSpace(name)) return string.Empty;
        var parts = name.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length == 0) return string.Empty;
        if (parts.Length == 1) return parts[0][..Math.Min(2, parts[0].Length)].ToUpperInvariant();
        return $"{parts[0][0]}{parts[^1][0]}".ToUpperInvariant();
    }

    public async Task<ProjectDto> GetByIdAsync(string workspaceSlug, Guid projectId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.AsNoTracking()
            .FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var project = await db.Projects.AsNoTracking()
            .Include(c => c.StateGroup).Include(c => c.Team)
            .FirstOrDefaultAsync(c => c.Id == projectId && c.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Project not found.");

        var result = mapper.Map<ProjectDto>(project);
        await EnrichProjectsAsync(new[] { result }, ct);
        return result;
    }

    public async Task DeleteAsync(string workspaceSlug, Guid projectId, Guid userId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var project = await db.Projects.FirstOrDefaultAsync(c => c.Id == projectId && c.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Project not found.");

        if (project.OwnerId != userId)
            throw new ForbiddenException("Only the project owner can delete it.");

        project.IsDeleted = true;
        project.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
    }

    public async Task<ProjectDto> UpdateAsync(string workspaceSlug, Guid projectId, Guid userId, UpdateProjectDto dto, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var project = await db.Projects
            .Include(c => c.StateGroup).Include(c => c.Team)
            .FirstOrDefaultAsync(c => c.Id == projectId && c.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Project not found.");

        var isMemberAdmin = await db.ProjectMembers
            .AnyAsync(m => m.ProjectId == projectId && m.UserId == userId && m.Role == ProjectRole.Admin, ct);

        if (project.OwnerId != userId && !isMemberAdmin)
            throw new ForbiddenException("Only project admins can update it.");

        if (dto.Name != null) project.Name = dto.Name;
        if (dto.Description != null) project.Description = dto.Description;
        if (dto.LogoUrl != null) project.LogoUrl = dto.LogoUrl;
        if (dto.CyclesEnabled.HasValue) project.CyclesEnabled = dto.CyclesEnabled.Value;
        if (dto.ModulesEnabled.HasValue) project.ModulesEnabled = dto.ModulesEnabled.Value;
        if (dto.IntakeEnabled.HasValue) project.IntakeEnabled = dto.IntakeEnabled.Value;
        if (dto.ArchivesEnabled.HasValue) project.ArchivesEnabled = dto.ArchivesEnabled.Value;

        if (dto.StateGroupId.HasValue && dto.StateGroupId.Value != project.StateGroupId)
        {
            var newGroup = await db.StateGroups
                .Include(g => g.States)
                .FirstOrDefaultAsync(g => g.Id == dto.StateGroupId.Value, ct)
                ?? throw new ValidationException("State group not found.");

            var defaultState = newGroup.States.FirstOrDefault(s => s.IsDefault && !s.IsDeleted)
                ?? throw new ValidationException("El nuevo grupo no tiene un estado por defecto definido.");

            await db.Issues
                .Where(i => i.ProjectId == projectId)
                .ExecuteUpdateAsync(s => s.SetProperty(i => i.StateId, defaultState.Id), ct);

            project.StateGroupId = newGroup.Id;
            project.StateGroup = newGroup;
        }

        await db.SaveChangesAsync(ct);

        var result = mapper.Map<ProjectDto>(project);
        await EnrichProjectsAsync(new[] { result }, ct);
        return result;
    }

    public async Task<ProjectDto> UpdateTeamAsync(string workspaceSlug, Guid projectId, Guid userId, UpdateProjectTeamDto dto, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var project = await db.Projects
            .Include(c => c.StateGroup).Include(c => c.Team)
            .FirstOrDefaultAsync(c => c.Id == projectId && c.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Project not found.");

        var isMemberAdmin = await db.ProjectMembers
            .AnyAsync(m => m.ProjectId == projectId && m.UserId == userId && m.Role == ProjectRole.Admin, ct);

        if (project.OwnerId != userId && !isMemberAdmin)
            throw new ForbiddenException("Only project admins can change the assigned team.");

        if (dto.TeamId.HasValue)
        {
            var team = await db.Teams
                .FirstOrDefaultAsync(t => t.Id == dto.TeamId.Value && t.WorkspaceId == workspace.Id, ct)
                ?? throw new ValidationException("The selected team does not belong to this workspace.");

            project.TeamId = team.Id;
            project.Team = team;
        }
        else
        {
            project.TeamId = null;
            project.Team = null;
        }

        await db.SaveChangesAsync(ct);

        var result = mapper.Map<ProjectDto>(project);
        await EnrichProjectsAsync(new[] { result }, ct);
        return result;
    }

    public async Task<IEnumerable<ProjectMemberDto>> GetMembersAsync(string workspaceSlug, Guid projectId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.AsNoTracking()
            .FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var project = await db.Projects.AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == projectId && c.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Project not found.");

        var members = await db.ProjectMembers
            .AsNoTracking()
            .Include(m => m.User)
            .Where(m => m.ProjectId == project.Id)
            .OrderBy(m => m.User.Email)
            .ToListAsync(ct);

        return mapper.Map<IEnumerable<ProjectMemberDto>>(members);
    }

    public async Task<ProjectMemberDto> AddMemberAsync(string workspaceSlug, Guid projectId, AddProjectMemberDto dto, Guid requesterId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var project = await db.Projects.FirstOrDefaultAsync(c => c.Id == projectId && c.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Project not found.");

        var isRequesterAdmin = await db.ProjectMembers
            .AnyAsync(m => m.ProjectId == projectId && m.UserId == requesterId && m.Role == ProjectRole.Admin, ct);

        if (project.OwnerId != requesterId && !isRequesterAdmin)
            throw new ForbiddenException("Only project admins can add members.");

        if (!Enum.IsDefined(typeof(ProjectRole), dto.Role))
            throw new ValidationException("Invalid role.");

        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == dto.UserId, ct)
            ?? throw new NotFoundException("User not found.");

        var alreadyMember = await db.ProjectMembers
            .AnyAsync(m => m.ProjectId == projectId && m.UserId == dto.UserId, ct);

        if (alreadyMember)
            throw new ValidationException("El usuario ya es miembro de este proyecto.");

        var member = new ProjectMember
        {
            ProjectId = projectId,
            UserId = dto.UserId,
            Role = dto.Role,
            User = user
        };

        db.ProjectMembers.Add(member);
        await db.SaveChangesAsync(ct);
        return mapper.Map<ProjectMemberDto>(member);
    }

    public async Task RemoveMemberAsync(string workspaceSlug, Guid projectId, Guid userId, Guid requesterId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var project = await db.Projects.FirstOrDefaultAsync(c => c.Id == projectId && c.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Project not found.");

        var isRequesterAdmin = await db.ProjectMembers
            .AnyAsync(m => m.ProjectId == projectId && m.UserId == requesterId && m.Role == ProjectRole.Admin, ct);

        if (project.OwnerId != requesterId && !isRequesterAdmin)
            throw new ForbiddenException("Only project admins can remove members.");

        if (project.OwnerId == userId)
            throw new ValidationException("Cannot remove the project owner.");

        var member = await db.ProjectMembers
            .FirstOrDefaultAsync(m => m.ProjectId == projectId && m.UserId == userId, ct)
            ?? throw new NotFoundException("Member not found in this project.");

        member.IsDeleted = true;
        member.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
    }

    public async Task<ProjectMemberDto> UpdateMemberRoleAsync(string workspaceSlug, Guid projectId, Guid userId, UpdateProjectMemberRoleDto dto, Guid requesterId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var project = await db.Projects.FirstOrDefaultAsync(c => c.Id == projectId && c.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Project not found.");

        var isRequesterAdmin = await db.ProjectMembers
            .AnyAsync(m => m.ProjectId == projectId && m.UserId == requesterId && m.Role == ProjectRole.Admin, ct);

        if (project.OwnerId != requesterId && !isRequesterAdmin)
            throw new ForbiddenException("Only project admins can change member roles.");

        if (project.OwnerId == userId)
            throw new ValidationException("Cannot change the role of the project owner.");

        var member = await db.ProjectMembers
            .Include(m => m.User)
            .FirstOrDefaultAsync(m => m.ProjectId == projectId && m.UserId == userId, ct)
            ?? throw new NotFoundException("Member not found in this project.");

        if (member.Role == ProjectRole.Admin && dto.Role != ProjectRole.Admin)
        {
            var otherAdmins = await db.ProjectMembers
                .CountAsync(m => m.ProjectId == projectId && m.UserId != userId && m.Role == ProjectRole.Admin, ct);
            if (otherAdmins == 0)
                throw new ValidationException("La empresa debe tener al menos un Administrador.");
        }

        member.Role = dto.Role;
        await db.SaveChangesAsync(ct);
        return mapper.Map<ProjectMemberDto>(member);
    }

    public async Task<ProjectInvitationDto> InviteMemberAsync(string workspaceSlug, Guid projectId, CreateProjectInvitationDto dto, Guid invitedById, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var project = await db.Projects.FirstOrDefaultAsync(c => c.Id == projectId && c.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Project not found.");

        var isRequesterAdmin = await db.ProjectMembers
            .AnyAsync(m => m.ProjectId == projectId && m.UserId == invitedById && m.Role == ProjectRole.Admin, ct);

        if (project.OwnerId != invitedById && !isRequesterAdmin)
            throw new ForbiddenException("Only project admins can invite members.");

        var normalizedEmail = dto.Email.ToLowerInvariant();

        var alreadyMember = await db.ProjectMembers
            .Include(m => m.User)
            .AnyAsync(m => m.ProjectId == projectId && m.User.Email == normalizedEmail, ct);

        if (alreadyMember)
            throw new ValidationException($"User '{dto.Email}' is already a member of this project.");

        var invitation = new ProjectInvitation
        {
            ProjectId = projectId,
            Email = normalizedEmail,
            Token = Guid.NewGuid().ToString("N"),
            Role = dto.Role,
            InvitedById = invitedById,
            ExpiresAt = DateTime.UtcNow.AddDays(7)
        };

        db.ProjectInvitations.Add(invitation);
        await db.SaveChangesAsync(ct);

        var frontendUrl = configuration["App:FrontendUrl"] ?? "http://localhost:5173";
        var inviteLink = $"{frontendUrl}/invitations/project/{invitation.Token}";
        await emailService.SendProjectInvitationAsync(normalizedEmail, project.Name, inviteLink, ct);

        return mapper.Map<ProjectInvitationDto>(invitation);
    }

    public async Task AcceptInvitationAsync(string token, Guid userId, CancellationToken ct = default)
    {
        var invitation = await db.ProjectInvitations
            .FirstOrDefaultAsync(i => i.Token == token && i.AcceptedAt == null && i.ExpiresAt > DateTime.UtcNow, ct)
            ?? throw new NotFoundException("Invitation not found, already accepted, or expired.");

        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == userId, ct)
            ?? throw new NotFoundException("User not found.");

        if (!string.Equals(user.Email, invitation.Email, StringComparison.OrdinalIgnoreCase))
            throw new ValidationException("This invitation was sent to a different email address.");

        var alreadyMember = await db.ProjectMembers
            .AnyAsync(m => m.ProjectId == invitation.ProjectId && m.UserId == userId, ct);

        if (alreadyMember)
            throw new ValidationException("You are already a member of this project.");

        db.ProjectMembers.Add(new ProjectMember
        {
            ProjectId = invitation.ProjectId,
            UserId = userId,
            Role = invitation.Role
        });

        invitation.AcceptedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
    }

    public async Task<IEnumerable<ProjectInvitationDto>> GetPendingInvitationsAsync(string workspaceSlug, Guid projectId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.AsNoTracking()
            .FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var project = await db.Projects.AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == projectId && c.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Project not found.");

        var invitations = await db.ProjectInvitations
            .AsNoTracking()
            .Where(i => i.ProjectId == project.Id && i.AcceptedAt == null && i.ExpiresAt > DateTime.UtcNow)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync(ct);

        return mapper.Map<IEnumerable<ProjectInvitationDto>>(invitations);
    }

    public async Task RevokeInvitationAsync(Guid invitationId, Guid requesterId, CancellationToken ct = default)
    {
        var invitation = await db.ProjectInvitations
            .Include(i => i.Project)
            .FirstOrDefaultAsync(i => i.Id == invitationId, ct)
            ?? throw new NotFoundException("Invitation not found.");

        var isRequesterAdmin = await db.ProjectMembers
            .AnyAsync(m => m.ProjectId == invitation.ProjectId && m.UserId == requesterId && m.Role == ProjectRole.Admin, ct);

        if (invitation.Project.OwnerId != requesterId && !isRequesterAdmin)
            throw new ForbiddenException("Only project admins can revoke invitations.");

        invitation.IsDeleted = true;
        invitation.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
    }
}
