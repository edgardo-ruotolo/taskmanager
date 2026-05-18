namespace TaskManager.Api.Modules.Files.Dtos;

public class RegisterFileAssetDto
{
    public string FileName { get; set; } = "";
    public string StoragePath { get; set; } = "";
    public string ContentType { get; set; } = "";
    public long SizeBytes { get; set; }
    public string? EntityType { get; set; }
    public string? EntityId { get; set; }
}
