namespace TaskManager.Api.Modules.Auth.Entities;

public class MagicLinkToken
{
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public string Email { get; set; } = string.Empty;
    // HMAC-SHA256 hash of the raw token (base64url, no padding). Raw token is never stored.
    public string TokenHash { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public bool IsUsed { get; set; }
    public DateTime? UsedAt { get; set; }
}
