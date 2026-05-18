namespace TaskManager.Api.Modules.Auth.Dtos;

public class ApiTokenDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = "";
    public string TokenPrefix { get; set; } = "";
    public DateTime? ExpiresAt { get; set; }
    public DateTime? LastUsedAt { get; set; }
    public bool IsRevoked { get; set; }
    public Guid UserId { get; set; }
    public DateTime CreatedAt { get; set; }
}
