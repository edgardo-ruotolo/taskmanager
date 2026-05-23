namespace TaskManager.Api.Common.Email;

public interface IEmailService
{
    Task SendWelcomeAsync(string toEmail, string toName, CancellationToken ct = default);
    Task SendPasswordResetAsync(string toEmail, string toName, string resetUrl, CancellationToken ct = default);
    Task SendMagicLinkAsync(string toEmail, string toName, string magicUrl, CancellationToken ct = default);
    Task SendProjectInvitationAsync(string toEmail, string projectName, string inviteUrl, CancellationToken ct = default);
    Task SendMentionNotificationAsync(string toEmail, string mentionedName, string mentionerName, string issueTitle, string issueUrl, CancellationToken ct = default);
    Task SendIssueAssignedAsync(string toEmail, string assigneeName, string assignerName, string issueTitle, string issueUrl, CancellationToken ct = default);
    Task SendIssueCommentAsync(string toEmail, string recipientName, string commenterName, string issueTitle, string commentPreview, string issueUrl, CancellationToken ct = default);
    Task SendCycleStartingAsync(string toEmail, string recipientName, string cycleName, string cycleUrl, DateTime startDate, CancellationToken ct = default);
    Task SendDueDateReminderAsync(string toEmail, string recipientName, string issueTitle, string issueUrl, DateTime dueDate, CancellationToken ct = default);
}
