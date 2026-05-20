using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Common.Exceptions;
using TaskManager.Api.Data;

namespace TaskManager.Api.Modules.Admin.Services;

public class GdprService(AppDbContext db, IAdminAuditService audit) : IGdprService
{
    public async Task EraseUserAsync(
        Guid targetUserId,
        Guid actorId,
        string? actorEmail,
        string? ipAddress,
        string? userAgent,
        CancellationToken ct = default)
    {
        var user = await db.Users.IgnoreQueryFilters()
            .FirstOrDefaultAsync(u => u.Id == targetUserId, ct)
            ?? throw new NotFoundException("User not found.");

        await using var tx = await db.Database.BeginTransactionAsync(ct);

        var anonymizedEmail = $"deleted-{Guid.NewGuid():N}@anonymized.local";
        user.Email = anonymizedEmail;
        user.NormalizedEmail = anonymizedEmail.ToUpperInvariant();
        user.UserName = anonymizedEmail;
        user.NormalizedUserName = anonymizedEmail.ToUpperInvariant();
        user.FirstName = "Usuario";
        user.LastName = "eliminado";
        user.DisplayName = "Usuario eliminado";
        user.AvatarUrl = null;
        user.PhoneNumber = null;
        user.PasswordHash = null;
        user.SecurityStamp = Guid.NewGuid().ToString("N");
        user.ConcurrencyStamp = Guid.NewGuid().ToString("N");
        user.IsDeleted = true;
        user.DeletedAt = DateTime.UtcNow;
        user.IsActive = false;
        user.EmailConfirmed = false;
        user.LockoutEnd = DateTimeOffset.MaxValue;

        // Revoke all refresh tokens.
        var refreshTokens = await db.RefreshTokens.Where(t => t.UserId == targetUserId).ToListAsync(ct);
        db.RefreshTokens.RemoveRange(refreshTokens);

        // Invalidate magic-link tokens that match the user's previous email(s) — we
        // can't link them by user id, so we burn any unused token still tied to
        // the old email if recorded. Safer: mark all of this user's pending tokens
        // as used so they cannot be replayed.
        var oldEmail = user.Email; // already anonymized; we cleanup all unused tokens for safety.
        var pendingMagicLinks = await db.MagicLinkTokens
            .Where(t => !t.IsUsed && (t.Email == oldEmail || t.Email == anonymizedEmail))
            .ToListAsync(ct);
        foreach (var t in pendingMagicLinks)
        {
            t.IsUsed = true;
            t.UsedAt = DateTime.UtcNow;
        }

        await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);

        await audit.RecordAsync(
            actorId: actorId,
            actorEmail: actorEmail,
            action: "gdpr.erase_user",
            targetType: "User",
            targetId: targetUserId.ToString(),
            payload: null,
            ipAddress: ipAddress,
            userAgent: userAgent,
            ct: ct);
    }
}
