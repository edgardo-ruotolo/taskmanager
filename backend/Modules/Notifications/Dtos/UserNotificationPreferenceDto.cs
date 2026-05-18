namespace TaskManager.Api.Modules.Notifications.Dtos;

public class UserNotificationPreferenceDto
{
    public Guid Id { get; set; }
    public string NotificationType { get; set; } = string.Empty;
    public string Property { get; set; } = string.Empty;
    public bool EmailNotification { get; set; }
}

public class UpsertNotificationPreferenceDto
{
    public string NotificationType { get; set; } = string.Empty;
    public string Property { get; set; } = string.Empty;
    public bool EmailNotification { get; set; }
}
