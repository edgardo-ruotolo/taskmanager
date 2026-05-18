namespace TaskManager.Api.Modules.Exporter.Dtos;

public class CreateExportDto
{
    public string Format { get; set; } = "csv"; // csv | xlsx | json
    public string? Filters { get; set; }
}
