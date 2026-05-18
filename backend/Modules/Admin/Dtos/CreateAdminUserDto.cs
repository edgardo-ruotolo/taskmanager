namespace TaskManager.Api.Modules.Admin.Dtos;

public class CreateAdminUserDto
{
    public string Email { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string Password { get; set; } = string.Empty;
    public string Role { get; set; } = "Member";
}
