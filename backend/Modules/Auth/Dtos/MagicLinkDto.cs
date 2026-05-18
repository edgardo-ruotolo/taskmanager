namespace TaskManager.Api.Modules.Auth.Dtos;

public class MagicLinkRequestDto
{
    public string Email { get; set; } = string.Empty;
}

public class MagicLinkVerifyDto
{
    public string Token { get; set; } = string.Empty;
}
