using System.Text.RegularExpressions;

namespace TaskManager.Api.Modules.Files.Services;

public class LocalFileStorage(IWebHostEnvironment env, IConfiguration configuration) : IFileStorageService
{
    private static readonly Regex StoragePathPattern = new(
        @"^uploads/[A-Za-z0-9_\-]+\.[a-z0-9]+$",
        RegexOptions.Compiled);

    private string UploadsPath => Path.Combine(env.WebRootPath ?? env.ContentRootPath, "uploads");
    private string BaseDirectory => env.WebRootPath ?? env.ContentRootPath;
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
        // Reject empty paths or anything that does not match the expected `uploads/<name>.<ext>` shape.
        if (string.IsNullOrWhiteSpace(storagePath) || !StoragePathPattern.IsMatch(storagePath))
            return Task.CompletedTask;

        var baseDir = Path.GetFullPath(BaseDirectory);
        var fullPath = Path.GetFullPath(Path.Combine(BaseDirectory, storagePath));

        // Defense in depth against traversal: ensure the resolved path stays under the base directory.
        if (!fullPath.StartsWith(baseDir + Path.DirectorySeparatorChar, StringComparison.Ordinal)
            && !fullPath.Equals(baseDir, StringComparison.Ordinal))
            return Task.CompletedTask;

        if (File.Exists(fullPath))
            File.Delete(fullPath);

        return Task.CompletedTask;
    }

    public string GetFileUrl(string storagePath) => $"{BaseUrl.TrimEnd('/')}/{storagePath}";
}
