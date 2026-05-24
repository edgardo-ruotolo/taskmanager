using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Common.Exceptions;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Files.Dtos;
using TaskManager.Api.Modules.Files.Entities;
using TaskManager.Api.Modules.Realtime;
using TaskManager.Api.Modules.Realtime.Contracts;

namespace TaskManager.Api.Modules.Files.Services;

public class FileAssetService(AppDbContext db, IMapper mapper, IFileStorageService storageService, IRealtimePublisher realtime) : IFileAssetService
{
    private async Task EmitIssueAttachmentChangedAsync(string? entityType, string? entityId, Guid actorId, CancellationToken ct)
    {
        if (!string.Equals(entityType, "issue", StringComparison.OrdinalIgnoreCase)) return;
        if (string.IsNullOrWhiteSpace(entityId) || !Guid.TryParse(entityId, out var issueId)) return;

        var projectId = await db.Issues.AsNoTracking()
            .Where(i => i.Id == issueId)
            .Select(i => i.ProjectId)
            .FirstOrDefaultAsync(ct);

        if (projectId == Guid.Empty) return;

        var evt = new RealtimeEvent("attachment.changed", string.Empty, projectId, issueId, actorId, DateTimeOffset.UtcNow);
        await realtime.PublishToProjectAsync(projectId, evt, ct);
        await realtime.PublishToIssueAsync(issueId, evt, ct);
    }

    public async Task<List<FileAssetDto>> GetAssetsAsync(Guid workspaceId, string? entityType = null, string? entityId = null, CancellationToken ct = default)
    {
        var query = db.FileAssets.Where(f => f.WorkspaceId == workspaceId);

        if (!string.IsNullOrEmpty(entityType))
            query = query.Where(f => f.EntityType == entityType);

        if (!string.IsNullOrEmpty(entityId))
            query = query.Where(f => f.EntityId == entityId);

        var assets = await query.OrderByDescending(f => f.CreatedAt).ToListAsync(ct);

        return assets.Select(a =>
        {
            var dto = mapper.Map<FileAssetDto>(a);
            dto.Url = storageService.GetFileUrl(a.StoragePath);
            return dto;
        }).ToList();
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

        await EmitIssueAttachmentChangedAsync(asset.EntityType, asset.EntityId, uploadedById, ct);

        var dto = mapper.Map<FileAssetDto>(asset);
        dto.Url = storageService.GetFileUrl(asset.StoragePath);
        return dto;
    }

    public async Task DeleteAssetAsync(Guid assetId, Guid requesterId, CancellationToken ct = default)
    {
        var asset = await db.FileAssets.FirstOrDefaultAsync(f => f.Id == assetId, ct)
            ?? throw new NotFoundException("File asset not found.");

        var entityType = asset.EntityType;
        var entityId = asset.EntityId;

        try
        {
            await storageService.DeleteFileAsync(asset.StoragePath, ct);
        }
        catch
        {
            // File may already be gone; proceed with soft delete.
        }

        asset.IsDeleted = true;
        asset.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);

        await EmitIssueAttachmentChangedAsync(entityType, entityId, requesterId, ct);
    }

    public async Task<FileAssetDto> UploadAsync(Guid workspaceId, Guid uploadedById, IFormFile file, string? entityType = null, string? entityId = null, CancellationToken ct = default)
    {
        await using var stream = file.OpenReadStream();
        var storagePath = await storageService.SaveFileAsync(stream, file.FileName, file.ContentType, ct);

        return await RegisterAssetAsync(workspaceId, uploadedById, file.FileName, storagePath, file.ContentType, file.Length, entityType, entityId, ct);
    }
}
