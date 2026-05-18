namespace TaskManager.Api.Common.Email;

public interface IEmailService
{
    Task SendPasswordResetAsync(string toEmail, string resetLink, CancellationToken ct = default);
    Task SendWelcomeAsync(string toEmail, string firstName, CancellationToken ct = default);
    Task SendWorkspaceInvitationAsync(string toEmail, string workspaceName, string inviteLink, CancellationToken ct = default);
    Task SendCompanyInvitationAsync(string toEmail, string companyName, string inviteLink, CancellationToken ct = default);
}
