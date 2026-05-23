using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Common.Exceptions;
using TaskManager.Api.Common.Pagination;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Intake.Dtos;
using TaskManager.Api.Modules.Intake.Entities;

namespace TaskManager.Api.Modules.Intake.Services;

public class IntakeService(AppDbContext db, IMapper mapper) : IIntakeService
{
    public async Task<PagedResult<IntakeIssueDto>> GetAllAsync(
        Guid projectId, string? status, int page, int pageSize, CancellationToken ct = default)
    {
        var query = db.IntakeIssues.Where(i => i.ProjectId == projectId);

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<IntakeStatus>(status, true, out var parsed))
            query = query.Where(i => i.Status == parsed);

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(i => i.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return new PagedResult<IntakeIssueDto>
        {
            Items = mapper.Map<IEnumerable<IntakeIssueDto>>(items),
            TotalCount = total,
            Page = page,
            PageSize = pageSize,
        };
    }

    public async Task<IntakeIssueDto> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var item = await db.IntakeIssues.FirstOrDefaultAsync(i => i.Id == id, ct)
            ?? throw new NotFoundException("Intake issue not found.");
        return mapper.Map<IntakeIssueDto>(item);
    }

    public async Task<IntakeIssueDto> CreateAsync(Guid projectId, CreateIntakeIssueDto dto, CancellationToken ct = default)
    {
        var item = new IntakeIssue
        {
            ProjectId = projectId,
            Title = dto.Title,
            Description = dto.Description,
            Source = dto.Source ?? "manual",
            SubmitterEmail = dto.SubmitterEmail,
            Status = IntakeStatus.Pending,
        };
        db.IntakeIssues.Add(item);
        await db.SaveChangesAsync(ct);
        return mapper.Map<IntakeIssueDto>(item);
    }

    public async Task<IntakeIssueDto> ReviewAsync(Guid id, Guid reviewerId, ReviewIntakeIssueDto dto, CancellationToken ct = default)
    {
        var item = await db.IntakeIssues.FirstOrDefaultAsync(i => i.Id == id, ct)
            ?? throw new NotFoundException("Intake issue not found.");

        item.Status = dto.Status;
        item.ReviewedByUserId = reviewerId;
        item.ReviewedAt = DateTime.UtcNow;

        if (dto.DeclineReason is not null) item.DeclineReason = dto.DeclineReason;
        if (dto.SnoozedUntil.HasValue) item.SnoozedUntil = dto.SnoozedUntil;
        if (dto.AcceptedAsIssueId.HasValue) item.AcceptedAsIssueId = dto.AcceptedAsIssueId;
        if (dto.DuplicateOfIssueId.HasValue) item.DuplicateOfIssueId = dto.DuplicateOfIssueId;

        await db.SaveChangesAsync(ct);
        return mapper.Map<IntakeIssueDto>(item);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var item = await db.IntakeIssues.FirstOrDefaultAsync(i => i.Id == id, ct)
            ?? throw new NotFoundException("Intake issue not found.");
        item.IsDeleted = true;
        item.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
    }
}
