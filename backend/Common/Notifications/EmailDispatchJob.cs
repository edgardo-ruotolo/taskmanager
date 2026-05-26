using Hangfire;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Common.Email;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Notifications.Entities;

namespace TaskManager.Api.Common.Notifications;

/// <summary>
/// Hangfire-invoked worker that processes a single <see cref="EmailJobPayload"/>:
/// applies user preferences, resolves the Brevo template id, and calls <see cref="IEmailService"/>.
/// Hangfire handles retries and persistence — we only own the business logic here.
/// </summary>
public class EmailDispatchJob(
    AppDbContext db,
    IEmailService email,
    IConfiguration configuration,
    ILogger<EmailDispatchJob> logger)
{
    [AutomaticRetry(Attempts = 3, DelaysInSeconds = new[] { 30, 120, 600 })]
    public async Task SendAsync(EmailJobPayload payload, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(payload.RecipientEmail))
        {
            logger.LogWarning("EmailDispatchJob skipped — empty recipient email (kind={Kind}, user={UserId})",
                payload.Kind, payload.RecipientUserId);
            return;
        }

        var settings = await db.UserNotificationSettings
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.UserId == payload.RecipientUserId, ct);

        if (settings is { EmailUnsubscribed: true })
        {
            logger.LogInformation("Skipping {Kind} to {Email} — user unsubscribed", payload.Kind, payload.RecipientEmail);
            return;
        }

        var gate = EmailJobKindGate.Gate(payload.Kind);
        if (gate.HasValue)
        {
            var (type, property) = gate.Value;
            var pref = await db.UserNotificationPreferences
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.UserId == payload.RecipientUserId
                    && p.NotificationType == type
                    && p.Property == property, ct);

            // Default = opt-in: when no row exists we assume the user wants the email.
            // Only explicit `EmailNotification == false` suppresses delivery.
            if (pref is { EmailNotification: false })
            {
                logger.LogInformation("Skipping {Kind} to {Email} — preference {Type}/{Property} disabled",
                    payload.Kind, payload.RecipientEmail, type, property);
                return;
            }
        }

        var templateId = configuration.GetValue<int?>($"Brevo:Templates:{payload.Kind}");
        var frontendUrl = configuration["App:FrontendUrl"] ?? "";

        if (settings is not null)
        {
            payload.Params["unsubscribeUrl"] = $"{frontendUrl.TrimEnd('/')}/unsubscribe?token={settings.UnsubscribeToken}";
        }

        await email.SendTemplateAsync(
            payload.RecipientEmail,
            payload.RecipientName,
            payload.Kind,
            templateId,
            payload.Params,
            settings?.UnsubscribeToken,
            ct);
    }
}
