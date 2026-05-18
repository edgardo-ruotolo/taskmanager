namespace TaskManager.Api.Modules.Admin.Dtos;

public class AdminCompanyMemberDto
{
    public Guid UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string? DisplayName { get; set; }
    public string Role { get; set; } = string.Empty;
}
