namespace TaskManager.Api.Modules.Home.Dtos;

public class WorkspaceQuickLinkDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Icon { get; set; }
    public int Sequence { get; set; }
    public DateTime CreatedAt { get; set; }
}
