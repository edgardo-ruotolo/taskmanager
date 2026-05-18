using TaskManager.Api.Common.Auditing;

namespace TaskManager.Api.Modules.Auth.Entities;

public class ApiToken : AuditableEntity
{
    public string Name { get; set; } = "";
    public string TokenHash { get; set; } = "";
    public string TokenPrefix { get; set; } = "";
    public DateTime? ExpiresAt { get; set; }
    public DateTime? LastUsedAt { get; set; }
    public bool IsRevoked { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
}
