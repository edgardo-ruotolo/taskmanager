namespace TaskManager.Api.Modules.Auth.Dtos;

public class CreateApiTokenDto
{
    public string Name { get; set; } = "";
    public DateTime? ExpiresAt { get; set; }
}
