namespace TaskManager.Api.Modules.Home.Dtos;

public class CreateQuickLinkDto
{
    public string Title { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Icon { get; set; }
}
