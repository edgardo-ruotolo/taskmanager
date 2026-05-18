namespace TaskManager.Api.Modules.Admin.Dtos;

public class AdminUserDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? DisplayName { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public IList<string> Roles { get; set; } = [];
}
