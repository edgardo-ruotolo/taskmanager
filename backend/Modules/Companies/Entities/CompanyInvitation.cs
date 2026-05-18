using TaskManager.Api.Common.Auditing;

namespace TaskManager.Api.Modules.Companies.Entities;

public class CompanyInvitation : AuditableEntity
{
    public Guid CompanyId { get; set; }
    public Company Company { get; set; } = null!;
    public string Email { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
    public CompanyRole Role { get; set; } = CompanyRole.Member;
    public Guid InvitedById { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime? AcceptedAt { get; set; }
}
