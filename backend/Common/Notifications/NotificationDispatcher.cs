using Hangfire;

namespace TaskManager.Api.Common.Notifications;

public class NotificationDispatcher(IBackgroundJobClient jobs) : INotificationDispatcher
{
    public void Enqueue(EmailJobPayload payload)
    {
        jobs.Enqueue<EmailDispatchJob>(j => j.SendAsync(payload, CancellationToken.None));
    }

    public void EnqueueMany(IEnumerable<EmailJobPayload> payloads)
    {
        foreach (var p in payloads) Enqueue(p);
    }
}
