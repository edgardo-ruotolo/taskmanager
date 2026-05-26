namespace TaskManager.Api.Modules.Cycles.Dtos;

public class CycleMemberSummaryDto
{
    public Guid UserId { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public string Initials { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
}
