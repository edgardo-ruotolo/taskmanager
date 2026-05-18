namespace TaskManager.Api.Modules.Auth.Entities;

public class ApiActivityLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ApiTokenId { get; set; }
    public ApiToken ApiToken { get; set; } = null!;
    public string Path { get; set; } = string.Empty;
    public string Method { get; set; } = string.Empty;
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public int ResponseCode { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
