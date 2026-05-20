namespace TaskManager.Api.Modules.Admin.Entities;

public class AdminAuditLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Action { get; set; } = string.Empty;
    public Guid ActorId { get; set; }
    public string? ActorEmail { get; set; }
    public string? TargetType { get; set; }
    public string? TargetId { get; set; }
    public string? Payload { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
