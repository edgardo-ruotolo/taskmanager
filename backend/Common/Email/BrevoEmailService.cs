using System.Text;
using System.Text.Json;

namespace TaskManager.Api.Common.Email;

public class BrevoEmailService(HttpClient httpClient, IConfiguration configuration, ILogger<BrevoEmailService> logger)
    : IEmailService
{
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    private bool TryGetApiKey(out string apiKey)
    {
        apiKey = configuration["Brevo:ApiKey"] ?? string.Empty;
        if (!string.IsNullOrWhiteSpace(apiKey)) return true;

        logger.LogWarning("Brevo:ApiKey is not configured. Email sending is disabled.");
        return false;
    }

    private async Task SendAsync(object payload, string apiKey, CancellationToken ct)
    {
        var json = JsonSerializer.Serialize(payload, JsonOptions);
        using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.brevo.com/v3/smtp/email");
        request.Headers.Add("api-key", apiKey);
        request.Content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await httpClient.SendAsync(request, ct);
        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync(ct);
            logger.LogWarning("Brevo API returned {StatusCode}: {Body}", response.StatusCode, body);
        }
    }

    public async Task SendWelcomeAsync(string toEmail, string toName, CancellationToken ct = default)
    {
        if (!TryGetApiKey(out var apiKey)) return;

        var payload = new
        {
            sender = new { name = "TaskManager", email = "noreply@taskmanager.app" },
            to = new[] { new { email = toEmail } },
            subject = "Welcome to TaskManager",
            htmlContent = $"""
                <p>Hello {toName},</p>
                <p>Welcome to TaskManager! Your account has been created successfully.</p>
                <p>You can now sign in and start managing your projects.</p>
                """
        };

        await SendAsync(payload, apiKey, ct);
    }

    public async Task SendPasswordResetAsync(string toEmail, string toName, string resetUrl, CancellationToken ct = default)
    {
        if (!TryGetApiKey(out var apiKey)) return;

        var payload = new
        {
            sender = new { name = "TaskManager", email = "noreply@taskmanager.app" },
            to = new[] { new { email = toEmail } },
            subject = "Reset your password",
            htmlContent = $"""
                <p>Hello {toName},</p>
                <p>We received a request to reset your password.</p>
                <p>Click the link below to continue:</p>
                <p><a href="{resetUrl}">Reset password</a></p>
                <p>If you did not request this, you can safely ignore this email.</p>
                """
        };

        await SendAsync(payload, apiKey, ct);
    }

    public async Task SendMagicLinkAsync(string toEmail, string toName, string magicUrl, CancellationToken ct = default)
    {
        if (!TryGetApiKey(out var apiKey)) return;

        var payload = new
        {
            sender = new { name = "TaskManager", email = "noreply@taskmanager.app" },
            to = new[] { new { email = toEmail } },
            subject = "Your magic link",
            htmlContent = $"""
                <p>Hello {toName},</p>
                <p>Click the link below to sign in to TaskManager:</p>
                <p><a href="{magicUrl}">Sign in</a></p>
                <p>This link will expire in 15 minutes.</p>
                """
        };

        await SendAsync(payload, apiKey, ct);
    }

    public async Task SendWorkspaceInvitationAsync(string toEmail, string inviterName, string workspaceName, string inviteUrl, CancellationToken ct = default)
    {
        if (!TryGetApiKey(out var apiKey)) return;

        var payload = new
        {
            sender = new { name = "TaskManager", email = "noreply@taskmanager.app" },
            to = new[] { new { email = toEmail } },
            subject = $"You have been invited to {workspaceName}",
            htmlContent = $"""
                <p>{inviterName} has invited you to join the workspace <strong>{workspaceName}</strong> on TaskManager.</p>
                <p>Click the link below to accept the invitation:</p>
                <p><a href="{inviteUrl}">Accept invitation</a></p>
                <p>This link will expire in 7 days.</p>
                """
        };

        await SendAsync(payload, apiKey, ct);
    }

    public async Task SendCompanyInvitationAsync(string toEmail, string companyName, string inviteUrl, CancellationToken ct = default)
    {
        if (!TryGetApiKey(out var apiKey)) return;

        var payload = new
        {
            sender = new { name = "TaskManager", email = "noreply@taskmanager.app" },
            to = new[] { new { email = toEmail } },
            subject = $"You have been invited to {companyName}",
            htmlContent = $"""
                <p>You have been invited to join the company <strong>{companyName}</strong> on TaskManager.</p>
                <p>Click the link below to accept the invitation:</p>
                <p><a href="{inviteUrl}">Accept invitation</a></p>
                <p>This link will expire in 7 days.</p>
                """
        };

        await SendAsync(payload, apiKey, ct);
    }

    public async Task SendMentionNotificationAsync(string toEmail, string mentionedName, string mentionerName, string issueTitle, string issueUrl, CancellationToken ct = default)
    {
        if (!TryGetApiKey(out var apiKey)) return;

        var payload = new
        {
            sender = new { name = "TaskManager", email = "noreply@taskmanager.app" },
            to = new[] { new { email = toEmail } },
            subject = $"{mentionerName} mentioned you in \"{issueTitle}\"",
            htmlContent = $"""
                <p>Hello {mentionedName},</p>
                <p><strong>{mentionerName}</strong> mentioned you in the issue <strong>{issueTitle}</strong>.</p>
                <p><a href="{issueUrl}">View issue</a></p>
                """
        };

        await SendAsync(payload, apiKey, ct);
    }

    public async Task SendIssueAssignedAsync(string toEmail, string assigneeName, string assignerName, string issueTitle, string issueUrl, CancellationToken ct = default)
    {
        if (!TryGetApiKey(out var apiKey)) return;

        var payload = new
        {
            sender = new { name = "TaskManager", email = "noreply@taskmanager.app" },
            to = new[] { new { email = toEmail } },
            subject = $"You have been assigned to \"{issueTitle}\"",
            htmlContent = $"""
                <p>Hello {assigneeName},</p>
                <p><strong>{assignerName}</strong> assigned you to the issue <strong>{issueTitle}</strong>.</p>
                <p><a href="{issueUrl}">View issue</a></p>
                """
        };

        await SendAsync(payload, apiKey, ct);
    }

    public async Task SendIssueCommentAsync(string toEmail, string recipientName, string commenterName, string issueTitle, string commentPreview, string issueUrl, CancellationToken ct = default)
    {
        if (!TryGetApiKey(out var apiKey)) return;

        var payload = new
        {
            sender = new { name = "TaskManager", email = "noreply@taskmanager.app" },
            to = new[] { new { email = toEmail } },
            subject = $"New comment on \"{issueTitle}\"",
            htmlContent = $"""
                <p>Hello {recipientName},</p>
                <p><strong>{commenterName}</strong> commented on <strong>{issueTitle}</strong>:</p>
                <blockquote>{commentPreview}</blockquote>
                <p><a href="{issueUrl}">View comment</a></p>
                """
        };

        await SendAsync(payload, apiKey, ct);
    }

    public async Task SendCycleStartingAsync(string toEmail, string recipientName, string cycleName, string cycleUrl, DateTime startDate, CancellationToken ct = default)
    {
        if (!TryGetApiKey(out var apiKey)) return;

        var payload = new
        {
            sender = new { name = "TaskManager", email = "noreply@taskmanager.app" },
            to = new[] { new { email = toEmail } },
            subject = $"Cycle \"{cycleName}\" is starting soon",
            htmlContent = $"""
                <p>Hello {recipientName},</p>
                <p>The cycle <strong>{cycleName}</strong> is starting on <strong>{startDate:MMMM d, yyyy}</strong>.</p>
                <p><a href="{cycleUrl}">View cycle</a></p>
                """
        };

        await SendAsync(payload, apiKey, ct);
    }

    public async Task SendDueDateReminderAsync(string toEmail, string recipientName, string issueTitle, string issueUrl, DateTime dueDate, CancellationToken ct = default)
    {
        if (!TryGetApiKey(out var apiKey)) return;

        var payload = new
        {
            sender = new { name = "TaskManager", email = "noreply@taskmanager.app" },
            to = new[] { new { email = toEmail } },
            subject = $"Reminder: \"{issueTitle}\" is due soon",
            htmlContent = $"""
                <p>Hello {recipientName},</p>
                <p>The issue <strong>{issueTitle}</strong> is due on <strong>{dueDate:MMMM d, yyyy}</strong>.</p>
                <p><a href="{issueUrl}">View issue</a></p>
                """
        };

        await SendAsync(payload, apiKey, ct);
    }
}
