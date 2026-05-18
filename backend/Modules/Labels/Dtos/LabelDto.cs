namespace TaskManager.Api.Modules.Labels.Dtos;

public class LabelDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid WorkspaceId { get; set; }
    public DateTime CreatedAt { get; set; }
}
