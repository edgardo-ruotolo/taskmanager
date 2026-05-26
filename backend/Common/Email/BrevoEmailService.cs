using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Common.Notifications;
using TaskManager.Api.Data;

namespace TaskManager.Api.Common.Email;

/// <summary>
/// Brevo (ex-Sendinblue) transactional email provider. Posts to
/// <c>https://api.brevo.com/v3/smtp/email</c> using a configured template id
/// and merge variables. Hangfire owns retries, so this class is intentionally thin.
/// Reads <c>BrevoApiKey</c> first from <see cref="Modules.Admin.Entities.InstanceConfiguration"/>
/// (configured via the god-mode UI), falling back to <c>Brevo:ApiKey</c> in appsettings.
/// </summary>
public class BrevoEmailService(
    HttpClient httpClient,
    IConfiguration configuration,
    AppDbContext db,
    ILogger<BrevoEmailService> logger) : IEmailService
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull
    };

    public async Task SendTemplateAsync(
        string toEmail,
        string toName,
        EmailJobKind kind,
        int? templateId,
        IDictionary<string, object?> parameters,
        string? unsubscribeToken,
        CancellationToken ct = default)
    {
        var (apiKey, dbFromEmail, dbFromName) = await ResolveBrevoCredentialsAsync(ct);
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            logger.LogWarning("Brevo API key is not configured (neither in DB nor in appsettings) — dropping {Kind} email to {Email}", kind, toEmail);
            return;
        }

        if (templateId is null or 0)
        {
            logger.LogWarning("Brevo:Templates:{Kind} is not configured — dropping email to {Email}", kind, toEmail);
            return;
        }

        var fromEmail = !string.IsNullOrWhiteSpace(dbFromEmail)
            ? dbFromEmail
            : configuration["Brevo:FromEmail"] ?? "noreply@taskmanager.app";
        var fromName = !string.IsNullOrWhiteSpace(dbFromName)
            ? dbFromName
            : configuration["Brevo:FromName"] ?? "TaskManager";
        var frontendUrl = configuration["App:FrontendUrl"]?.TrimEnd('/') ?? "";

        var headers = new Dictionary<string, string>();
        if (!string.IsNullOrWhiteSpace(unsubscribeToken) && !string.IsNullOrWhiteSpace(frontendUrl))
        {
            headers["List-Unsubscribe"] = $"<{frontendUrl}/unsubscribe?token={unsubscribeToken}>";
            headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
        }

        var payload = new
        {
            sender = new { name = fromName, email = fromEmail },
            to = new[] { new { email = toEmail, name = string.IsNullOrWhiteSpace(toName) ? toEmail : toName } },
            templateId = templateId.Value,
            @params = parameters,
            headers = headers.Count > 0 ? headers : null
        };

        var json = JsonSerializer.Serialize(payload, JsonOptions);
        using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.brevo.com/v3/smtp/email")
        {
            Content = new StringContent(json, Encoding.UTF8, "application/json")
        };
        request.Headers.Add("api-key", apiKey);
        request.Headers.Add("accept", "application/json");

        var response = await httpClient.SendAsync(request, ct);
        if (response.IsSuccessStatusCode)
        {
            logger.LogInformation("Brevo accepted {Kind} (template {TemplateId}) for {Email}", kind, templateId, toEmail);
            return;
        }

        var body = await response.Content.ReadAsStringAsync(ct);
        // Throw on 5xx and 429 so Hangfire retries; swallow 4xx (bad address etc.) to avoid storming.
        if ((int)response.StatusCode >= 500 || response.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
        {
            logger.LogWarning("Brevo {StatusCode} for {Kind} to {Email} — Hangfire will retry. Body: {Body}",
                response.StatusCode, kind, toEmail, body);
            throw new HttpRequestException($"Brevo returned {(int)response.StatusCode}: {body}");
        }

        logger.LogError("Brevo {StatusCode} for {Kind} to {Email} — giving up. Body: {Body}",
            response.StatusCode, kind, toEmail, body);
    }

    private async Task<(string? ApiKey, string? FromEmail, string? FromName)> ResolveBrevoCredentialsAsync(CancellationToken ct)
    {
        var row = await db.InstanceConfigurations
            .AsNoTracking()
            .Select(c => new { c.BrevoApiKey, c.BrevoFromEmail, c.BrevoFromName })
            .FirstOrDefaultAsync(ct);
        var apiKey = !string.IsNullOrWhiteSpace(row?.BrevoApiKey) ? row.BrevoApiKey : configuration["Brevo:ApiKey"];
        return (apiKey, row?.BrevoFromEmail, row?.BrevoFromName);
    }
}
