using TaskManager.Api.Modules.Auth.Dtos;

namespace TaskManager.Api.Modules.Auth.Services;

public interface IOAuthAccountService
{
    Task<List<OAuthAccountDto>> GetAccountsAsync(Guid userId, CancellationToken ct = default);
    Task LinkAccountAsync(Guid userId, string provider, string providerUserId, string? providerEmail, CancellationToken ct = default);
    Task UnlinkAccountAsync(Guid accountId, Guid userId, CancellationToken ct = default);
}
