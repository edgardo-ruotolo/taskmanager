namespace TaskManager.Api.Modules.Notifications.Dtos;

public class UserNotificationSettingsDto
{
    public Guid Id { get; set; }
    public bool EmailUnsubscribed { get; set; }
    public bool EmailDailyDigest { get; set; }
}

public class UpdateUserNotificationSettingsDto
{
    public bool? EmailUnsubscribed { get; set; }
    public bool? EmailDailyDigest { get; set; }
}
