using TaskManager.Api.Modules.Companies.Entities;

namespace TaskManager.Api.Modules.Companies.Dtos;

public class CompanyInvitationDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public CompanyRole Role { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime? AcceptedAt { get; set; }
}
