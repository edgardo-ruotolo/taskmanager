namespace TaskManager.Api.Modules.Files.Services;

public class LocalFileStorage(IWebHostEnvironment env, IConfiguration configuration) : IFileStorageService
{
    private string UploadsPath => Path.Combine(env.WebRootPath ?? env.ContentRootPath, "uploads");
    private string BaseUrl => configuration["App:BaseUrl"] ?? "http://localhost:5000";

    public async Task<string> SaveFileAsync(Stream fileStream, string fileName, string contentType, CancellationToken ct = default)
    {
        Directory.CreateDirectory(UploadsPath);

        var ext = Path.GetExtension(fileName);
        var storageName = $"{Guid.NewGuid():N}{ext}";
        var fullPath = Path.Combine(UploadsPath, storageName);

        await using var dest = File.Create(fullPath);
        await fileStream.CopyToAsync(dest, ct);

        return $"uploads/{storageName}";
    }

    public Task DeleteFileAsync(string storagePath, CancellationToken ct = default)
    {
        var fullPath = Path.Combine(env.WebRootPath ?? env.ContentRootPath, storagePath);
        if (File.Exists(fullPath))
            File.Delete(fullPath);
        return Task.CompletedTask;
    }

    public string GetFileUrl(string storagePath) => $"{BaseUrl.TrimEnd('/')}/{storagePath}";
}
