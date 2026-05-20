using TaskManager.Api.Modules.Auth.Entities;

namespace TaskManager.Api.Modules.Notifications.Entities;

public class UserNotificationPreference
{
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public string NotificationType { get; set; } = string.Empty;
    public string Property { get; set; } = string.Empty;
    public bool EmailNotification { get; set; } = true;
}
