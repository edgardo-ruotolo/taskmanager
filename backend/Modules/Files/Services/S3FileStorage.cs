namespace TaskManager.Api.Modules.Files.Services;

// Stub — wire this by registering it instead of LocalFileStorage and providing AWS credentials.
public class S3FileStorage : IFileStorageService
{
    public Task<string> SaveFileAsync(Stream fileStream, string fileName, string contentType, CancellationToken ct = default)
        => throw new NotImplementedException("S3 storage not configured. Set AWS credentials and register S3FileStorage.");

    public Task DeleteFileAsync(string storagePath, CancellationToken ct = default)
        => throw new NotImplementedException("S3 storage not configured.");

    public string GetFileUrl(string storagePath)
        => throw new NotImplementedException("S3 storage not configured.");
}
