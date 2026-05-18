using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Common.Exceptions;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.States.Dtos;
using TaskManager.Api.Modules.States.Entities;

namespace TaskManager.Api.Modules.States.Services;

public class StateGroupService(AppDbContext db, IMapper mapper) : IStateGroupService
{
    public async Task<IEnumerable<StateGroupDto>> GetAllAsync(CancellationToken ct = default)
    {
        var groups = await db.StateGroups
            .Include(g => g.States.Where(s => !s.IsDeleted).OrderBy(s => s.Sequence))
            .OrderBy(g => g.Name)
            .ToListAsync(ct);
        return mapper.Map<IEnumerable<StateGroupDto>>(groups);
    }

    public async Task<StateGroupDto> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var group = await db.StateGroups
            .Include(g => g.States.Where(s => !s.IsDeleted).OrderBy(s => s.Sequence))
            .FirstOrDefaultAsync(g => g.Id == id, ct)
            ?? throw new NotFoundException($"StateGroup {id} not found.");
        return mapper.Map<StateGroupDto>(group);
    }

    public async Task<StateGroupDto> CreateAsync(CreateStateGroupDto dto, CancellationToken ct = default)
    {
        var group = new StateGroup
        {
            Name = dto.Name,
            Description = dto.Description,
            IsDefault = false
        };
        db.StateGroups.Add(group);
        await db.SaveChangesAsync(ct);
        return mapper.Map<StateGroupDto>(group);
    }

    public async Task<StateGroupDto> UpdateAsync(Guid id, UpdateStateGroupDto dto, CancellationToken ct = default)
    {
        var group = await db.StateGroups.FindAsync([id], ct)
            ?? throw new NotFoundException($"StateGroup {id} not found.");

        if (dto.Name is not null) group.Name = dto.Name;
        if (dto.Description is not null) group.Description = dto.Description;

        await db.SaveChangesAsync(ct);
        return mapper.Map<StateGroupDto>(group);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var group = await db.StateGroups.FindAsync([id], ct)
            ?? throw new NotFoundException($"StateGroup {id} not found.");

        if (group.IsDefault)
            throw new InvalidOperationException("Cannot delete the default state group.");

        var hasCompanies = await db.Companies.AnyAsync(c => c.StateGroupId == id, ct);
        if (hasCompanies)
            throw new InvalidOperationException("Cannot delete a state group that is assigned to companies.");

        group.IsDeleted = true;
        group.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
    }
}
