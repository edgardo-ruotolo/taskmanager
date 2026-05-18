using TaskManager.Api.Common.Auditing;

namespace TaskManager.Api.Modules.Auth.Entities;

public class OAuthAccount : AuditableEntity
{
    public string Provider { get; set; } = "";
    public string ProviderUserId { get; set; } = "";
    public string? ProviderEmail { get; set; }
    public string? AccessToken { get; set; }
    public string? RefreshToken { get; set; }
    public DateTime? TokenExpiresAt { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
}
