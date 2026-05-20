namespace TaskManager.Api.Modules.Auth.Services;

public interface IRefreshTokenService
{
    Task<(string token, DateTime expiresAt)> IssueAsync(Guid userId, string? ip, CancellationToken ct);

    Task<(Guid userId, string newToken, DateTime newExpiresAt)?> RotateAsync(
        string presentedToken, string? ip, CancellationToken ct);

    Task RevokeAsync(string presentedToken, string? ip, CancellationToken ct);

    Task RevokeAllForUserAsync(Guid userId, string? ip, CancellationToken ct);
}
