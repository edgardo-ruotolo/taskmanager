using TaskManager.Api.Common.Notifications;

namespace TaskManager.Api.Common.Email;

/// <summary>
/// Single entry point for transactional email. Every call selects a Brevo template
/// via <paramref name="kind"/> / <paramref name="templateId"/> and merges
/// <paramref name="parameters"/> into the template variables.
/// </summary>
public interface IEmailService
{
    Task SendTemplateAsync(
        string toEmail,
        string toName,
        EmailJobKind kind,
        int? templateId,
        IDictionary<string, object?> parameters,
        string? unsubscribeToken,
        CancellationToken ct = default);
}
