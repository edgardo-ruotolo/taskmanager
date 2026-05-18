using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Data;

namespace TaskManager.Api.Common.Auth;

public class ApiTokenAuthenticationMiddleware(RequestDelegate next)
{
    private const string Scheme = "ApiKey ";

    public async Task InvokeAsync(HttpContext context)
    {
        var authHeader = context.Request.Headers.Authorization.ToString();

        if (authHeader.StartsWith(Scheme, StringComparison.OrdinalIgnoreCase))
        {
            var rawToken = authHeader[Scheme.Length..].Trim();

            if (rawToken.Length >= 8)
            {
                await TryAuthenticateAsync(context, rawToken);
            }
        }

        await next(context);
    }

    private static async Task TryAuthenticateAsync(HttpContext context, string rawToken)
    {
        var prefix = rawToken[..8];
        var hash = Convert.ToBase64String(SHA256.HashData(Encoding.UTF8.GetBytes(rawToken)));

        var db = context.RequestServices.GetRequiredService<AppDbContext>();

        var token = await db.ApiTokens
            .Include(t => t.User)
            .FirstOrDefaultAsync(t =>
                t.TokenPrefix == prefix &&
                t.TokenHash == hash &&
                !t.IsRevoked &&
                (t.ExpiresAt == null || t.ExpiresAt > DateTime.UtcNow));

        if (token == null)
            return;

        token.LastUsedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, token.UserId.ToString()),
            new Claim(ClaimTypes.Email, token.User.Email ?? string.Empty),
            new Claim(ClaimTypes.Name, token.User.UserName ?? string.Empty),
        };

        var identity = new ClaimsIdentity(claims, "ApiKey");
        context.User = new ClaimsPrincipal(identity);
    }
}
