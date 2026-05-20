using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Auth.Entities;

namespace TaskManager.Api.Modules.Auth.Services;

public class RefreshTokenService(AppDbContext db, IConfiguration configuration) : IRefreshTokenService
{
    private static readonly TimeSpan Lifetime = TimeSpan.FromDays(30);

    private byte[] Secret
    {
        get
        {
            var secret = configuration["Auth:RefreshTokenSecret"];
            if (string.IsNullOrWhiteSpace(secret))
                throw new InvalidOperationException("Auth:RefreshTokenSecret is not configured.");
            return Encoding.UTF8.GetBytes(secret);
        }
    }

    private string Hash(string rawToken)
    {
        using var hmac = new HMACSHA256(Secret);
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(rawToken));
        return Convert.ToBase64String(hash).TrimEnd('=').Replace('+', '-').Replace('/', '_');
    }

    private static string GenerateToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(64);
        return Convert.ToBase64String(bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_');
    }

    public async Task<(string token, DateTime expiresAt)> IssueAsync(Guid userId, string? ip, CancellationToken ct)
    {
        var raw = GenerateToken();
        var expiresAt = DateTime.UtcNow.Add(Lifetime);

        db.RefreshTokens.Add(new RefreshToken
        {
            UserId = userId,
            TokenHash = Hash(raw),
            ExpiresAt = expiresAt,
            CreatedByIp = ip
        });
        await db.SaveChangesAsync(ct);

        return (raw, expiresAt);
    }

    public async Task<(Guid userId, string newToken, DateTime newExpiresAt)?> RotateAsync(
        string presentedToken, string? ip, CancellationToken ct)
    {
        var presentedHash = Hash(presentedToken);
        var now = DateTime.UtcNow;

        var existing = await db.RefreshTokens
            .FirstOrDefaultAsync(rt =>
                rt.TokenHash == presentedHash &&
                rt.RevokedAt == null &&
                rt.ExpiresAt > now, ct);

        if (existing is null) return null;

        var newRaw = GenerateToken();
        var newExpiresAt = now.Add(Lifetime);
        var newHash = Hash(newRaw);

        db.RefreshTokens.Add(new RefreshToken
        {
            UserId = existing.UserId,
            TokenHash = newHash,
            ExpiresAt = newExpiresAt,
            CreatedByIp = ip
        });

        existing.RevokedAt = now;
        existing.RevokedByIp = ip;
        existing.ReplacedByTokenHash = newHash;

        await db.SaveChangesAsync(ct);

        return (existing.UserId, newRaw, newExpiresAt);
    }

    public async Task RevokeAsync(string presentedToken, string? ip, CancellationToken ct)
    {
        var presentedHash = Hash(presentedToken);
        var existing = await db.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.TokenHash == presentedHash && rt.RevokedAt == null, ct);
        if (existing is null) return;

        existing.RevokedAt = DateTime.UtcNow;
        existing.RevokedByIp = ip;
        await db.SaveChangesAsync(ct);
    }

    public async Task RevokeAllForUserAsync(Guid userId, string? ip, CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        await db.RefreshTokens
            .Where(rt => rt.UserId == userId && rt.RevokedAt == null)
            .ExecuteUpdateAsync(s => s
                .SetProperty(rt => rt.RevokedAt, now)
                .SetProperty(rt => rt.RevokedByIp, ip), ct);
    }
}
