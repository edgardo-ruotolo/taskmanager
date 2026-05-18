namespace TaskManager.Api.Modules.Files.Dtos;

public class FileAssetDto
{
    public Guid Id { get; set; }
    public string FileName { get; set; } = "";
    public string ContentType { get; set; } = "";
    public long SizeBytes { get; set; }
    public string? EntityType { get; set; }
    public string? EntityId { get; set; }
    public Guid UploadedById { get; set; }
    public Guid WorkspaceId { get; set; }
    public DateTime CreatedAt { get; set; }
    public string Url { get; set; } = "";
}
