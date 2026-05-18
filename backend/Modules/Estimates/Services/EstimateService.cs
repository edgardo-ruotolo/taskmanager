using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Common.Exceptions;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Estimates.Dtos;
using TaskManager.Api.Modules.Estimates.Entities;

namespace TaskManager.Api.Modules.Estimates.Services;

public class EstimateService(AppDbContext db) : IEstimateService
{
    public async Task<List<EstimateDto>> GetAllAsync(string workspaceSlug, Guid companyId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var estimates = await db.Estimates
            .Include(e => e.Points)
            .Where(e => e.CompanyId == companyId && e.Company.WorkspaceId == workspace.Id)
            .OrderByDescending(e => e.CreatedAt)
            .ToListAsync(ct);

        return estimates.Select(MapToDto).ToList();
    }

    public async Task<EstimateDto> GetByIdAsync(string workspaceSlug, Guid companyId, Guid estimateId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var estimate = await db.Estimates
            .Include(e => e.Points)
            .FirstOrDefaultAsync(e => e.Id == estimateId && e.CompanyId == companyId && e.Company.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Estimate not found.");

        return MapToDto(estimate);
    }

    public async Task<EstimateDto> CreateAsync(string workspaceSlug, Guid companyId, CreateEstimateDto dto, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var company = await db.Companies.FirstOrDefaultAsync(c => c.Id == companyId && c.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Company not found.");

        var estimate = new Estimate
        {
            Name = dto.Name,
            Description = dto.Description,
            Type = dto.Type,
            CompanyId = company.Id
        };

        db.Estimates.Add(estimate);
        await db.SaveChangesAsync(ct);

        return MapToDto(estimate);
    }

    public async Task<EstimateDto> UpdateAsync(string workspaceSlug, Guid companyId, Guid estimateId, UpdateEstimateDto dto, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var estimate = await db.Estimates
            .Include(e => e.Points)
            .FirstOrDefaultAsync(e => e.Id == estimateId && e.CompanyId == companyId && e.Company.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Estimate not found.");

        if (dto.Name is not null) estimate.Name = dto.Name;
        if (dto.Description is not null) estimate.Description = dto.Description;
        if (dto.Type is not null) estimate.Type = dto.Type.Value;

        await db.SaveChangesAsync(ct);
        return MapToDto(estimate);
    }

    public async Task DeleteAsync(string workspaceSlug, Guid companyId, Guid estimateId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var estimate = await db.Estimates
            .FirstOrDefaultAsync(e => e.Id == estimateId && e.CompanyId == companyId && e.Company.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Estimate not found.");

        estimate.IsDeleted = true;
        estimate.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
    }

    public async Task<EstimatePointDto> AddPointAsync(string workspaceSlug, Guid companyId, Guid estimateId, CreateEstimatePointDto dto, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        _ = await db.Estimates
            .FirstOrDefaultAsync(e => e.Id == estimateId && e.CompanyId == companyId && e.Company.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Estimate not found.");

        var point = new EstimatePoint
        {
            Key = dto.Key,
            Value = dto.Value,
            Description = dto.Description,
            SortOrder = dto.SortOrder,
            EstimateId = estimateId
        };

        db.EstimatePoints.Add(point);
        await db.SaveChangesAsync(ct);

        return MapPointToDto(point);
    }

    public async Task DeletePointAsync(string workspaceSlug, Guid companyId, Guid estimateId, Guid pointId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        _ = await db.Estimates
            .FirstOrDefaultAsync(e => e.Id == estimateId && e.CompanyId == companyId && e.Company.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Estimate not found.");

        var point = await db.EstimatePoints.FindAsync([pointId], ct)
            ?? throw new NotFoundException("Estimate point not found.");

        db.EstimatePoints.Remove(point);
        await db.SaveChangesAsync(ct);
    }

    private static EstimateDto MapToDto(Estimate e) => new()
    {
        Id = e.Id,
        Name = e.Name,
        Description = e.Description,
        Type = e.Type,
        CompanyId = e.CompanyId,
        CreatedAt = e.CreatedAt,
        Points = e.Points.OrderBy(p => p.SortOrder).Select(MapPointToDto).ToList()
    };

    private static EstimatePointDto MapPointToDto(EstimatePoint p) => new()
    {
        Id = p.Id,
        Key = p.Key,
        Value = p.Value,
        Description = p.Description,
        SortOrder = p.SortOrder
    };
}
