namespace TaskManager.Api.Common.Email;

public class LogOnlyEmailService(ILogger<LogOnlyEmailService> logger) : IEmailService
{
    public Task SendWelcomeAsync(string toEmail, string toName, CancellationToken ct = default)
    {
        logger.LogInformation("[EMAIL STUB] Welcome → {Email} ({Name})", toEmail, toName);
        return Task.CompletedTask;
    }

    public Task SendPasswordResetAsync(string toEmail, string toName, string resetUrl, CancellationToken ct = default)
    {
        logger.LogInformation("[EMAIL STUB] PasswordReset → {Email} ({Name}) url={Url}", toEmail, toName, resetUrl);
        return Task.CompletedTask;
    }

    public Task SendMagicLinkAsync(string toEmail, string toName, string magicUrl, CancellationToken ct = default)
    {
        logger.LogInformation("[EMAIL STUB] MagicLink → {Email} ({Name}) url={Url}", toEmail, toName, magicUrl);
        return Task.CompletedTask;
    }

    public Task SendProjectInvitationAsync(string toEmail, string projectName, string inviteUrl, CancellationToken ct = default)
    {
        logger.LogInformation("[EMAIL STUB] ProjectInvitation → {Email} project={Project} url={Url}", toEmail, projectName, inviteUrl);
        return Task.CompletedTask;
    }

    public Task SendMentionNotificationAsync(string toEmail, string mentionedName, string mentionerName, string issueTitle, string issueUrl, CancellationToken ct = default)
    {
        logger.LogInformation("[EMAIL STUB] MentionNotification → {Email} mentioned={Mentioned} by={Mentioner} issue={Issue} url={Url}", toEmail, mentionedName, mentionerName, issueTitle, issueUrl);
        return Task.CompletedTask;
    }

    public Task SendIssueAssignedAsync(string toEmail, string assigneeName, string assignerName, string issueTitle, string issueUrl, CancellationToken ct = default)
    {
        logger.LogInformation("[EMAIL STUB] IssueAssigned → {Email} assignee={Assignee} by={Assigner} issue={Issue} url={Url}", toEmail, assigneeName, assignerName, issueTitle, issueUrl);
        return Task.CompletedTask;
    }

    public Task SendIssueCommentAsync(string toEmail, string recipientName, string commenterName, string issueTitle, string commentPreview, string issueUrl, CancellationToken ct = default)
    {
        logger.LogInformation("[EMAIL STUB] IssueComment → {Email} recipient={Recipient} commenter={Commenter} issue={Issue} preview={Preview} url={Url}", toEmail, recipientName, commenterName, issueTitle, commentPreview, issueUrl);
        return Task.CompletedTask;
    }

    public Task SendCycleStartingAsync(string toEmail, string recipientName, string cycleName, string cycleUrl, DateTime startDate, CancellationToken ct = default)
    {
        logger.LogInformation("[EMAIL STUB] CycleStarting → {Email} recipient={Recipient} cycle={Cycle} start={StartDate} url={Url}", toEmail, recipientName, cycleName, startDate, cycleUrl);
        return Task.CompletedTask;
    }

    public Task SendDueDateReminderAsync(string toEmail, string recipientName, string issueTitle, string issueUrl, DateTime dueDate, CancellationToken ct = default)
    {
        logger.LogInformation("[EMAIL STUB] DueDateReminder → {Email} recipient={Recipient} issue={Issue} due={DueDate} url={Url}", toEmail, recipientName, issueTitle, dueDate, issueUrl);
        return Task.CompletedTask;
    }
}
