using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Admin.Dtos;
using TaskManager.Api.Modules.Admin.Entities;

namespace TaskManager.Api.Modules.Admin.Services;

public class InstanceConfigService(AppDbContext db) : IInstanceConfigService
{
    public async Task<InstanceConfigDto> GetAsync(CancellationToken ct = default)
    {
        var config = await db.InstanceConfigurations.FirstOrDefaultAsync(ct);

        if (config is null)
        {
            config = new InstanceConfiguration();
            db.InstanceConfigurations.Add(config);
            await db.SaveChangesAsync(ct);
        }

        return MapToDto(config);
    }

    public async Task<InstanceConfigDto> UpdateAsync(UpdateInstanceConfigDto dto, CancellationToken ct = default)
    {
        var config = await db.InstanceConfigurations.FirstOrDefaultAsync(ct);

        if (config is null)
        {
            config = new InstanceConfiguration();
            db.InstanceConfigurations.Add(config);
        }

        if (dto.InstanceName is not null) config.InstanceName = dto.InstanceName;
        if (dto.IsSignUpEnabled.HasValue) config.IsSignUpEnabled = dto.IsSignUpEnabled.Value;
        if (dto.AdminEmail is not null) config.AdminEmail = dto.AdminEmail;
        if (dto.BrevoApiKey is not null) config.BrevoApiKey = dto.BrevoApiKey;
        if (dto.BrevoFromEmail is not null) config.BrevoFromEmail = dto.BrevoFromEmail;
        if (dto.BrevoFromName is not null) config.BrevoFromName = dto.BrevoFromName;
        if (dto.CloudinaryCloudName is not null) config.CloudinaryCloudName = dto.CloudinaryCloudName;
        if (dto.CloudinaryApiKey is not null) config.CloudinaryApiKey = dto.CloudinaryApiKey;
        if (dto.CloudinaryApiSecret is not null) config.CloudinaryApiSecret = dto.CloudinaryApiSecret;

        await db.SaveChangesAsync(ct);
        return MapToDto(config);
    }

    private static InstanceConfigDto MapToDto(InstanceConfiguration config) => new()
    {
        Id = config.Id,
        InstanceName = config.InstanceName,
        IsSignUpEnabled = config.IsSignUpEnabled,
        IsSetupDone = config.IsSetupDone,
        AdminEmail = config.AdminEmail,
        BrevoFromEmail = config.BrevoFromEmail,
        BrevoFromName = config.BrevoFromName,
        CreatedAt = config.CreatedAt,
        UpdatedAt = config.UpdatedAt
    };
}
