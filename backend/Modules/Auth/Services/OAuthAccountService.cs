using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Common.Exceptions;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Auth.Dtos;
using TaskManager.Api.Modules.Auth.Entities;

namespace TaskManager.Api.Modules.Auth.Services;

public class OAuthAccountService(AppDbContext db, IMapper mapper) : IOAuthAccountService
{
    public async Task<List<OAuthAccountDto>> GetAccountsAsync(Guid userId, CancellationToken ct = default)
    {
        var accounts = await db.OAuthAccounts
            .Where(a => a.UserId == userId)
            .OrderBy(a => a.Provider)
            .ToListAsync(ct);

        return mapper.Map<List<OAuthAccountDto>>(accounts);
    }

    public async Task LinkAccountAsync(Guid userId, string provider, string providerUserId, string? providerEmail, CancellationToken ct = default)
    {
        var existing = await db.OAuthAccounts
            .FirstOrDefaultAsync(a => a.Provider == provider && a.ProviderUserId == providerUserId, ct);

        if (existing is not null)
            return;

        var account = new OAuthAccount
        {
            UserId = userId,
            Provider = provider,
            ProviderUserId = providerUserId,
            ProviderEmail = providerEmail
        };

        db.OAuthAccounts.Add(account);
        await db.SaveChangesAsync(ct);
    }

    public async Task UnlinkAccountAsync(Guid accountId, Guid userId, CancellationToken ct = default)
    {
        var account = await db.OAuthAccounts.FirstOrDefaultAsync(a => a.Id == accountId && a.UserId == userId, ct)
            ?? throw new NotFoundException("OAuth account not found.");

        account.IsDeleted = true;
        account.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
    }
}
