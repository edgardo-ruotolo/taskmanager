using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Admin.Dtos;
using TaskManager.Api.Modules.Admin.Entities;

namespace TaskManager.Api.Modules.Admin.Services;

public class FeatureFlagService(AppDbContext db) : IFeatureFlagService
{
    public async Task<IReadOnlyList<FeatureFlagDto>> GetAllAsync(CancellationToken ct = default)
    {
        return await db.FeatureFlags
            .AsNoTracking()
            .OrderBy(f => f.Key)
            .Select(f => new FeatureFlagDto
            {
                Key = f.Key,
                Enabled = f.Enabled,
                Description = f.Description,
                UpdatedAt = f.UpdatedAt
            })
            .ToListAsync(ct);
    }

    public async Task<FeatureFlagDto> UpsertAsync(string key, UpdateFeatureFlagDto dto, CancellationToken ct = default)
    {
        var flag = await db.FeatureFlags.FirstOrDefaultAsync(f => f.Key == key, ct);
        if (flag is null)
        {
            flag = new FeatureFlag { Key = key, Enabled = dto.Enabled, Description = dto.Description };
            db.FeatureFlags.Add(flag);
        }
        else
        {
            flag.Enabled = dto.Enabled;
            if (dto.Description is not null) flag.Description = dto.Description;
            flag.UpdatedAt = DateTime.UtcNow;
        }
        await db.SaveChangesAsync(ct);
        return new FeatureFlagDto
        {
            Key = flag.Key,
            Enabled = flag.Enabled,
            Description = flag.Description,
            UpdatedAt = flag.UpdatedAt
        };
    }

    public async Task<bool> IsEnabledAsync(string key, CancellationToken ct = default)
    {
        return await db.FeatureFlags
            .AsNoTracking()
            .Where(f => f.Key == key)
            .Select(f => f.Enabled)
            .FirstOrDefaultAsync(ct);
    }
}
