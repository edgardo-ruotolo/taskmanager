using TaskManager.Api.Modules.Companies.Entities;

namespace TaskManager.Api.Modules.Companies.Dtos;

public class CompanyMemberDto
{
    public Guid UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string? DisplayName { get; set; }
    public string? AvatarUrl { get; set; }
    public CompanyRole Role { get; set; }
}
