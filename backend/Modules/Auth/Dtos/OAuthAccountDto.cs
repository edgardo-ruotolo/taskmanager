namespace TaskManager.Api.Modules.Auth.Dtos;

public class OAuthAccountDto
{
    public Guid Id { get; set; }
    public string Provider { get; set; } = "";
    public string? ProviderEmail { get; set; }
    public Guid UserId { get; set; }
    public DateTime CreatedAt { get; set; }
}
