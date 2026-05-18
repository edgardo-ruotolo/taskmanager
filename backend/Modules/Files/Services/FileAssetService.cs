using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Common.Exceptions;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Files.Dtos;
using TaskManager.Api.Modules.Files.Entities;

namespace TaskManager.Api.Modules.Files.Services;

public class FileAssetService(AppDbContext db, IMapper mapper) : IFileAssetService
{
    public async Task<List<FileAssetDto>> GetAssetsAsync(Guid workspaceId, string? entityType = null, string? entityId = null, CancellationToken ct = default)
    {
        var query = db.FileAssets.Where(f => f.WorkspaceId == workspaceId);

        if (!string.IsNullOrEmpty(entityType))
            query = query.Where(f => f.EntityType == entityType);

        if (!string.IsNullOrEmpty(entityId))
            query = query.Where(f => f.EntityId == entityId);

        var assets = await query.OrderByDescending(f => f.CreatedAt).ToListAsync(ct);

        return mapper.Map<List<FileAssetDto>>(assets);
    }

    public async Task<FileAssetDto> RegisterAssetAsync(Guid workspaceId, Guid uploadedById, string fileName, string storagePath, string contentType, long sizeBytes, string? entityType = null, string? entityId = null, CancellationToken ct = default)
    {
        var asset = new FileAsset
        {
            WorkspaceId = workspaceId,
            UploadedById = uploadedById,
            FileName = fileName,
            StoragePath = storagePath,
            ContentType = contentType,
            SizeBytes = sizeBytes,
            EntityType = entityType,
            EntityId = entityId
        };

        db.FileAssets.Add(asset);
        await db.SaveChangesAsync(ct);

        return mapper.Map<FileAssetDto>(asset);
    }

    public async Task DeleteAssetAsync(Guid assetId, Guid requesterId, CancellationToken ct = default)
    {
        var asset = await db.FileAssets.FirstOrDefaultAsync(f => f.Id == assetId, ct)
            ?? throw new NotFoundException("File asset not found.");

        asset.IsDeleted = true;
        asset.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
    }
}
