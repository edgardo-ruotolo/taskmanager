namespace TaskManager.Api.Modules.Admin.Services;

public interface IGdprService
{
    /// <summary>
    /// Permanently anonymizes a user (GDPR Right to Erasure / "right to be forgotten").
    /// - Marks the User row as deleted and replaces PII with anonymized stubs.
    /// - Revokes all active refresh tokens and magic-link tokens for the user.
    /// - Records the action in the admin audit log.
    /// </summary>
    Task EraseUserAsync(Guid targetUserId, Guid actorId, string? actorEmail, string? ipAddress, string? userAgent, CancellationToken ct = default);
}
