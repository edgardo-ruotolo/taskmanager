using System.Security.Cryptography;
using System.Text;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Common.Exceptions;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Auth.Dtos;
using TaskManager.Api.Modules.Auth.Entities;

namespace TaskManager.Api.Modules.Auth.Services;

public class ApiTokenService(AppDbContext db, IMapper mapper) : IApiTokenService
{
    public async Task<List<ApiTokenDto>> GetTokensAsync(Guid userId, CancellationToken ct = default)
    {
        var tokens = await db.ApiTokens
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync(ct);

        return mapper.Map<List<ApiTokenDto>>(tokens);
    }

    public async Task<CreateApiTokenResponseDto> CreateTokenAsync(Guid userId, CreateApiTokenDto dto, CancellationToken ct = default)
    {
        var rawToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
        var hash = Convert.ToBase64String(SHA256.HashData(Encoding.UTF8.GetBytes(rawToken)));
        var prefix = rawToken[..8];

        var token = new ApiToken
        {
            Name = dto.Name,
            TokenHash = hash,
            TokenPrefix = prefix,
            ExpiresAt = dto.ExpiresAt,
            UserId = userId
        };

        db.ApiTokens.Add(token);
        await db.SaveChangesAsync(ct);

        return new CreateApiTokenResponseDto
        {
            Id = token.Id,
            Name = token.Name,
            Token = rawToken,
            TokenPrefix = prefix,
            ExpiresAt = token.ExpiresAt
        };
    }

    public async Task RevokeTokenAsync(Guid tokenId, Guid userId, CancellationToken ct = default)
    {
        var token = await db.ApiTokens.FirstOrDefaultAsync(t => t.Id == tokenId && t.UserId == userId, ct)
            ?? throw new NotFoundException("Token not found.");

        token.IsRevoked = true;
        token.IsDeleted = true;
        token.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
    }
}
