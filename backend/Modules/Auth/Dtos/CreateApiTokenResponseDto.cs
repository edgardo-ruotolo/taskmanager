namespace TaskManager.Api.Modules.Auth.Dtos;

public class CreateApiTokenResponseDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = "";
    public string Token { get; set; } = "";
    public string TokenPrefix { get; set; } = "";
    public DateTime? ExpiresAt { get; set; }
}
