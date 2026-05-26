using TaskManager.Api.Common.Notifications;

namespace TaskManager.Api.Common.Email;

/// <summary>
/// Development / staging fallback that logs every outbound email instead of hitting Brevo.
/// Wired in when <c>Email:UseRealProvider=false</c> or <c>Brevo:ApiKey</c> is empty.
/// </summary>
public class LogOnlyEmailService(ILogger<LogOnlyEmailService> logger) : IEmailService
{
    public Task SendTemplateAsync(
        string toEmail,
        string toName,
        EmailJobKind kind,
        int? templateId,
        IDictionary<string, object?> parameters,
        string? unsubscribeToken,
        CancellationToken ct = default)
    {
        logger.LogInformation(
            "[EMAIL STUB] {Kind} → {Email} ({Name}) templateId={TemplateId} params={Params}",
            kind, toEmail, toName, templateId, parameters);
        return Task.CompletedTask;
    }
}
