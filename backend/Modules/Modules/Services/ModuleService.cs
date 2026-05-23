using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Common.Exceptions;
using TaskManager.Api.Common.Pagination;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Modules.Dtos;
using TaskManager.Api.Modules.Modules.Entities;

namespace TaskManager.Api.Modules.Modules.Services;

public class ModuleService(AppDbContext db) : IModuleService
{
    public async Task<PagedResult<ModuleDto>> GetAllAsync(string workspaceSlug, Guid projectId, int page, int pageSize, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.AsNoTracking()
            .FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var query = db.Modules
            .AsNoTracking()
            .Include(m => m.ModuleIssues)
            .Where(m => m.ProjectId == projectId && m.Project.WorkspaceId == workspace.Id);

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(m => m.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return new PagedResult<ModuleDto>
        {
            Items = items.Select(MapToDto),
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<ModuleDto> GetByIdAsync(string workspaceSlug, Guid projectId, Guid moduleId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.AsNoTracking()
            .FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var module = await db.Modules
            .AsNoTracking()
            .Include(m => m.ModuleIssues)
            .FirstOrDefaultAsync(m => m.Id == moduleId && m.ProjectId == projectId && m.Project.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Module not found.");

        return MapToDto(module);
    }

    public async Task<ModuleDto> CreateAsync(string workspaceSlug, Guid projectId, Guid userId, CreateModuleDto dto, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var project = await db.Projects.FirstOrDefaultAsync(c => c.Id == projectId && c.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Project not found.");

        var module = new Module
        {
            Name = dto.Name,
            Description = dto.Description,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            ProjectId = project.Id,
            OwnerId = userId
        };

        db.Modules.Add(module);
        await db.SaveChangesAsync(ct);

        return MapToDto(module);
    }

    public async Task<ModuleDto> UpdateAsync(string workspaceSlug, Guid projectId, Guid moduleId, UpdateModuleDto dto, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var module = await db.Modules
            .Include(m => m.ModuleIssues)
            .FirstOrDefaultAsync(m => m.Id == moduleId && m.ProjectId == projectId && m.Project.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Module not found.");

        if (dto.Name is not null) module.Name = dto.Name;
        if (dto.Description is not null) module.Description = dto.Description;
        if (dto.Status is not null) module.Status = dto.Status.Value;
        if (dto.StartDate is not null) module.StartDate = dto.StartDate;
        if (dto.EndDate is not null) module.EndDate = dto.EndDate;

        await db.SaveChangesAsync(ct);
        return MapToDto(module);
    }

    public async Task DeleteAsync(string workspaceSlug, Guid projectId, Guid moduleId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var module = await db.Modules
            .FirstOrDefaultAsync(m => m.Id == moduleId && m.ProjectId == projectId && m.Project.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Module not found.");

        module.IsDeleted = true;
        module.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
    }

    public async Task AddIssueAsync(string workspaceSlug, Guid projectId, Guid moduleId, Guid issueId, Guid userId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        _ = await db.Modules
            .FirstOrDefaultAsync(m => m.Id == moduleId && m.ProjectId == projectId && m.Project.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Module not found.");

        _ = await db.Issues.FindAsync([issueId], ct)
            ?? throw new NotFoundException("Issue not found.");

        var alreadyExists = await db.ModuleIssues
            .AnyAsync(mi => mi.ModuleId == moduleId && mi.IssueId == issueId, ct);

        if (alreadyExists)
            throw new ValidationException("Issue is already in this module.");

        db.ModuleIssues.Add(new ModuleIssue
        {
            ModuleId = moduleId,
            IssueId = issueId,
            AddedById = userId
        });

        await db.SaveChangesAsync(ct);
    }

    public async Task RemoveIssueAsync(string workspaceSlug, Guid projectId, Guid moduleId, Guid issueId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        _ = await db.Modules
            .FirstOrDefaultAsync(m => m.Id == moduleId && m.ProjectId == projectId && m.Project.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Module not found.");

        var moduleIssue = await db.ModuleIssues
            .FirstOrDefaultAsync(mi => mi.ModuleId == moduleId && mi.IssueId == issueId, ct)
            ?? throw new NotFoundException("Issue not found in this module.");

        moduleIssue.IsDeleted = true;
        moduleIssue.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
    }

    public async Task AddLinkAsync(string workspaceSlug, Guid projectId, Guid moduleId, AddModuleLinkDto dto, Guid userId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        _ = await db.Modules
            .FirstOrDefaultAsync(m => m.Id == moduleId && m.ProjectId == projectId && m.Project.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Module not found.");

        db.ModuleLinks.Add(new ModuleLink
        {
            ModuleId = moduleId,
            Title = dto.Title,
            Url = dto.Url,
            CreatedById = userId
        });

        await db.SaveChangesAsync(ct);
    }

    public async Task RemoveLinkAsync(string workspaceSlug, Guid projectId, Guid moduleId, Guid linkId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        _ = await db.Modules
            .FirstOrDefaultAsync(m => m.Id == moduleId && m.ProjectId == projectId && m.Project.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Module not found.");

        var link = await db.ModuleLinks
            .FirstOrDefaultAsync(l => l.Id == linkId && l.ModuleId == moduleId, ct)
            ?? throw new NotFoundException("Link not found.");

        link.IsDeleted = true;
        link.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
    }

    public async Task AddMemberAsync(string workspaceSlug, Guid projectId, Guid moduleId, Guid memberId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        _ = await db.Modules
            .FirstOrDefaultAsync(m => m.Id == moduleId && m.ProjectId == projectId && m.Project.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Module not found.");

        var alreadyExists = await db.ModuleMembers
            .AnyAsync(mm => mm.ModuleId == moduleId && mm.UserId == memberId, ct);

        if (alreadyExists)
            throw new ValidationException("User is already a member of this module.");

        db.ModuleMembers.Add(new ModuleMember
        {
            ModuleId = moduleId,
            UserId = memberId
        });

        await db.SaveChangesAsync(ct);
    }

    public async Task RemoveMemberAsync(string workspaceSlug, Guid projectId, Guid moduleId, Guid memberId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        _ = await db.Modules
            .FirstOrDefaultAsync(m => m.Id == moduleId && m.ProjectId == projectId && m.Project.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Module not found.");

        var member = await db.ModuleMembers
            .FirstOrDefaultAsync(mm => mm.ModuleId == moduleId && mm.UserId == memberId, ct)
            ?? throw new NotFoundException("Member not found in this module.");

        member.IsDeleted = true;
        member.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
    }

    public async Task<List<ModuleDto>> GetArchivedAsync(string workspaceSlug, Guid projectId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.AsNoTracking()
            .FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        return await db.Modules
            .AsNoTracking()
            .IgnoreQueryFilters()
            .Include(m => m.ModuleIssues)
            .Where(m => m.IsArchived && !m.IsDeleted && m.ProjectId == projectId && m.Project.WorkspaceId == workspace.Id)
            .OrderByDescending(m => m.ArchivedAt)
            .Select(m => MapToDto(m))
            .ToListAsync(ct);
    }

    public async Task ArchiveAsync(string workspaceSlug, Guid projectId, Guid moduleId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var module = await db.Modules
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(m => m.Id == moduleId && m.ProjectId == projectId && m.Project.WorkspaceId == workspace.Id && !m.IsDeleted, ct)
            ?? throw new NotFoundException("Module not found.");

        module.IsArchived = true;
        module.ArchivedAt = DateTime.UtcNow;
        module.Status = ModuleStatus.Archived;
        await db.SaveChangesAsync(ct);
    }

    public async Task UnarchiveAsync(string workspaceSlug, Guid projectId, Guid moduleId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var module = await db.Modules
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(m => m.Id == moduleId && m.ProjectId == projectId && m.Project.WorkspaceId == workspace.Id && !m.IsDeleted, ct)
            ?? throw new NotFoundException("Module not found.");

        module.IsArchived = false;
        module.ArchivedAt = null;
        module.Status = ModuleStatus.Backlog;
        await db.SaveChangesAsync(ct);
    }

    private static ModuleDto MapToDto(Module module) => new()
    {
        Id = module.Id,
        Name = module.Name,
        Description = module.Description,
        Status = module.Status,
        StartDate = module.StartDate,
        EndDate = module.EndDate,
        ProjectId = module.ProjectId,
        OwnerId = module.OwnerId,
        IssueCount = module.ModuleIssues.Count,
        IsArchived = module.IsArchived,
        ArchivedAt = module.ArchivedAt,
        CreatedAt = module.CreatedAt
    };
}
