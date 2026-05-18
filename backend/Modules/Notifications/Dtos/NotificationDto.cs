namespace TaskManager.Api.Modules.Notifications.Dtos;

public class NotificationDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = "";
    public string Message { get; set; } = "";
    public string EntityType { get; set; } = "";
    public string? EntityId { get; set; }
    public bool IsRead { get; set; }
    public Guid RecipientId { get; set; }
    public Guid? SenderId { get; set; }
    public DateTime CreatedAt { get; set; }
}
