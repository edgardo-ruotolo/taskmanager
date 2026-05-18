using TaskManager.Api.Modules.Auth.Dtos;

namespace TaskManager.Api.Modules.Auth.Services;

public interface IApiTokenService
{
    Task<List<ApiTokenDto>> GetTokensAsync(Guid userId, CancellationToken ct = default);
    Task<CreateApiTokenResponseDto> CreateTokenAsync(Guid userId, CreateApiTokenDto dto, CancellationToken ct = default);
    Task RevokeTokenAsync(Guid tokenId, Guid userId, CancellationToken ct = default);
}
