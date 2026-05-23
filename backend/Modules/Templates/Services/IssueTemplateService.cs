using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Common.Exceptions;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Templates.Dtos;
using TaskManager.Api.Modules.Templates.Entities;

namespace TaskManager.Api.Modules.Templates.Services;

public class IssueTemplateService(AppDbContext db) : IIssueTemplateService
{
    public async Task<List<IssueTemplateDto>> GetAllAsync(string workspaceSlug, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        return await db.IssueTemplates
            .Where(t => t.WorkspaceId == workspace.Id)
            .OrderBy(t => t.Name)
            .Select(t => ToDto(t))
            .ToListAsync(ct);
    }

    public async Task<IssueTemplateDto> GetByIdAsync(string workspaceSlug, Guid templateId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var template = await db.IssueTemplates
            .FirstOrDefaultAsync(t => t.Id == templateId && t.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Template not found.");

        return ToDto(template);
    }

    public async Task<IssueTemplateDto> CreateAsync(string workspaceSlug, CreateIssueTemplateDto dto, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var template = new IssueTemplate
        {
            Name = dto.Name,
            Description = dto.Description,
            WorkspaceId = workspace.Id,
            ProjectId = dto.ProjectId,
            TemplateJson = dto.TemplateJson
        };

        db.IssueTemplates.Add(template);
        await db.SaveChangesAsync(ct);
        return ToDto(template);
    }

    public async Task<IssueTemplateDto> UpdateAsync(string workspaceSlug, Guid templateId, CreateIssueTemplateDto dto, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var template = await db.IssueTemplates
            .FirstOrDefaultAsync(t => t.Id == templateId && t.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Template not found.");

        template.Name = dto.Name;
        if (dto.Description is not null) template.Description = dto.Description;
        if (dto.ProjectId is not null) template.ProjectId = dto.ProjectId;
        if (dto.TemplateJson is not null) template.TemplateJson = dto.TemplateJson;

        await db.SaveChangesAsync(ct);
        return ToDto(template);
    }

    public async Task DeleteAsync(string workspaceSlug, Guid templateId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var template = await db.IssueTemplates
            .FirstOrDefaultAsync(t => t.Id == templateId && t.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Template not found.");

        template.IsDeleted = true;
        template.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
    }

    private static IssueTemplateDto ToDto(IssueTemplate t) => new()
    {
        Id = t.Id,
        Name = t.Name,
        Description = t.Description,
        WorkspaceId = t.WorkspaceId,
        ProjectId = t.ProjectId,
        TemplateJson = t.TemplateJson,
        CreatedAt = t.CreatedAt,
        UpdatedAt = t.UpdatedAt
    };
}
