namespace TaskManager.Api.Modules.Exporter.Dtos;

public class ExporterHistoryDto
{
    public Guid Id { get; set; }
    public string Format { get; set; } = "";
    public string Status { get; set; } = "";
    public string? FileName { get; set; }
    public string? DownloadUrl { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}
