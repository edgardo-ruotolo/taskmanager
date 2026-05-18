using Microsoft.AspNetCore.Http;
using TaskManager.Api.Modules.Files.Dtos;

namespace TaskManager.Api.Modules.Files.Services;

public interface IFileAssetService
{
    Task<List<FileAssetDto>> GetAssetsAsync(Guid workspaceId, string? entityType = null, string? entityId = null, CancellationToken ct = default);
    Task<FileAssetDto> RegisterAssetAsync(Guid workspaceId, Guid uploadedById, string fileName, string storagePath, string contentType, long sizeBytes, string? entityType = null, string? entityId = null, CancellationToken ct = default);
    Task DeleteAssetAsync(Guid assetId, Guid requesterId, CancellationToken ct = default);
    Task<FileAssetDto> UploadAsync(Guid workspaceId, Guid uploadedById, IFormFile file, string? entityType = null, string? entityId = null, CancellationToken ct = default);
}
