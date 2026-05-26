namespace TaskManager.Api.Modules.Modules.Dtos;

public class ModuleMemberSummaryDto
{
    public Guid UserId { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public string Initials { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
}
