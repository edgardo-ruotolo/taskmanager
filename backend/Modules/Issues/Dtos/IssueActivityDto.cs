namespace TaskManager.Api.Modules.Issues.Dtos;

public class IssueActivityDto
{
    public Guid Id { get; set; }
    public string Field { get; set; } = "";
    public string? OldValue { get; set; }
    public string? NewValue { get; set; }
    public Guid ActorId { get; set; }
    public string ActorName { get; set; } = "";
    public DateTime CreatedAt { get; set; }
}
