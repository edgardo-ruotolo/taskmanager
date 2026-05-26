namespace TaskManager.Api.Common.Notifications;

/// <summary>
/// Fire-and-forget entry point that the domain services use to request an email.
/// Implementation enqueues the payload onto Hangfire so the call returns instantly.
/// </summary>
public interface INotificationDispatcher
{
    /// <summary>Enqueue a single email for delivery.</summary>
    void Enqueue(EmailJobPayload payload);

    /// <summary>Enqueue many emails (e.g. when broadcasting to all members of a project).</summary>
    void EnqueueMany(IEnumerable<EmailJobPayload> payloads);
}
