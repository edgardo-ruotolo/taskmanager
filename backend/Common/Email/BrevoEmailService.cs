using System.Text;
using System.Text.Json;

namespace TaskManager.Api.Common.Email;

public class BrevoEmailService(HttpClient httpClient, IConfiguration configuration, ILogger<BrevoEmailService> logger)
    : IEmailService
{
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    private bool TryConfigureRequest(out string apiKey)
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

    public async Task SendPasswordResetAsync(string toEmail, string resetLink, CancellationToken ct = default)
    {
        if (!TryConfigureRequest(out var apiKey)) return;

        var payload = new
        {
            sender = new { name = "TaskManager", email = "noreply@taskmanager.app" },
            to = new[] { new { email = toEmail } },
            subject = "Restablecer contraseña",
            htmlContent = $"""
                <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
                <p>Haz clic en el siguiente enlace para continuar:</p>
                <p><a href="{resetLink}">Restablecer contraseña</a></p>
                <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
                """
        };

        await SendAsync(payload, apiKey, ct);
    }

    public async Task SendWelcomeAsync(string toEmail, string firstName, CancellationToken ct = default)
    {
        if (!TryConfigureRequest(out var apiKey)) return;

        var payload = new
        {
            sender = new { name = "TaskManager", email = "noreply@taskmanager.app" },
            to = new[] { new { email = toEmail } },
            subject = "Bienvenido a TaskManager",
            htmlContent = $"""
                <p>Hola {firstName},</p>
                <p>¡Bienvenido a TaskManager! Tu cuenta ha sido creada exitosamente.</p>
                <p>Ya puedes iniciar sesión y comenzar a gestionar tus proyectos.</p>
                """
        };

        await SendAsync(payload, apiKey, ct);
    }

    public async Task SendWorkspaceInvitationAsync(string toEmail, string workspaceName, string inviteLink, CancellationToken ct = default)
    {
        if (!TryConfigureRequest(out var apiKey)) return;

        var payload = new
        {
            sender = new { name = "TaskManager", email = "noreply@taskmanager.app" },
            to = new[] { new { email = toEmail } },
            subject = $"Invitación al workspace {workspaceName}",
            htmlContent = $"""
                <p>Has sido invitado a unirte al workspace <strong>{workspaceName}</strong> en TaskManager.</p>
                <p>Haz clic en el siguiente enlace para aceptar la invitación:</p>
                <p><a href="{inviteLink}">Aceptar invitación</a></p>
                <p>Este enlace expirará en 7 días.</p>
                """
        };

        await SendAsync(payload, apiKey, ct);
    }

    public async Task SendCompanyInvitationAsync(string toEmail, string companyName, string inviteLink, CancellationToken ct = default)
    {
        if (!TryConfigureRequest(out var apiKey)) return;

        var payload = new
        {
            sender = new { name = "TaskManager", email = "noreply@taskmanager.app" },
            to = new[] { new { email = toEmail } },
            subject = $"Invitación a la empresa {companyName}",
            htmlContent = $"""
                <p>Has sido invitado a unirte a la empresa <strong>{companyName}</strong> en TaskManager.</p>
                <p>Haz clic en el siguiente enlace para aceptar la invitación:</p>
                <p><a href="{inviteLink}">Aceptar invitación</a></p>
                <p>Este enlace expirará en 7 días.</p>
                """
        };

        await SendAsync(payload, apiKey, ct);
    }
}
