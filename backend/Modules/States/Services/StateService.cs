using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Common.Exceptions;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.States.Dtos;
using TaskManager.Api.Modules.States.Entities;

namespace TaskManager.Api.Modules.States.Services;

public class StateService(AppDbContext db, IMapper mapper) : IStateService
{
    public async Task<IEnumerable<StateDto>> GetAllAsync(Guid? stateGroupId = null, CancellationToken ct = default)
    {
        var query = db.States.AsQueryable();
        if (stateGroupId.HasValue)
            query = query.Where(s => s.StateGroupId == stateGroupId.Value);
        var states = await query.OrderBy(s => s.Sequence).ToListAsync(ct);
        return mapper.Map<IEnumerable<StateDto>>(states);
    }

    public async Task<StateDto> CreateAsync(CreateStateDto dto, CancellationToken ct = default)
    {
        var maxSeq = await db.States
            .Where(s => s.StateGroupId == dto.StateGroupId)
            .MaxAsync(s => (float?)s.Sequence, ct) ?? 0f;
        var state = mapper.Map<State>(dto);
        state.Sequence = maxSeq + 10000f;
        db.States.Add(state);
        await db.SaveChangesAsync(ct);
        return mapper.Map<StateDto>(state);
    }

    public async Task DeleteAsync(Guid stateId, CancellationToken ct = default)
    {
        var state = await db.States.FindAsync([stateId], ct)
            ?? throw new NotFoundException($"State {stateId} not found.");
        state.IsDeleted = true;
        state.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
    }

    public async Task<StateDto> UpdateAsync(Guid stateId, UpdateStateDto dto, CancellationToken ct = default)
    {
        var state = await db.States.FindAsync([stateId], ct)
            ?? throw new NotFoundException($"State {stateId} not found.");

        if (dto.Name != null) state.Name = dto.Name;
        if (dto.Color != null) state.Color = dto.Color;
        if (dto.Category != null && Enum.TryParse<StateCategory>(dto.Category, ignoreCase: true, out var category))
            state.Category = category;
        if (dto.Sequence.HasValue) state.Sequence = dto.Sequence.Value;

        await db.SaveChangesAsync(ct);
        return mapper.Map<StateDto>(state);
    }
}
