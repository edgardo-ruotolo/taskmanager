using TaskManager.Api.Common.Auditing;
using TaskManager.Api.Modules.Auth.Entities;

namespace TaskManager.Api.Modules.Notifications.Entities;

public class Notification : AuditableEntity
{
    public string Title { get; set; } = "";
    public string Message { get; set; } = "";
    public string EntityType { get; set; } = "";
    public string? EntityId { get; set; }
    public bool IsRead { get; set; }
    public Guid RecipientId { get; set; }
    public User Recipient { get; set; } = null!;
    public Guid? SenderId { get; set; }
    public User? Sender { get; set; }
}
