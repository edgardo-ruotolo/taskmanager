namespace TaskManager.Api.Modules.Files.Services;

public interface IFileStorageService
{
    Task<string> SaveFileAsync(Stream fileStream, string fileName, string contentType, CancellationToken ct = default);
    Task DeleteFileAsync(string storagePath, CancellationToken ct = default);
    string GetFileUrl(string storagePath);
}
