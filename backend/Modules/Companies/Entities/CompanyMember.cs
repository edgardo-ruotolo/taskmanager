using TaskManager.Api.Common.Auditing;
using TaskManager.Api.Modules.Auth.Entities;

namespace TaskManager.Api.Modules.Companies.Entities;

public enum CompanyRole { Guest = 5, Member = 15, Lead = 18, Admin = 20 }

public class CompanyMember : AuditableEntity
{
    public Guid CompanyId { get; set; }
    public Company Company { get; set; } = null!;
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public CompanyRole Role { get; set; } = CompanyRole.Member;
}
