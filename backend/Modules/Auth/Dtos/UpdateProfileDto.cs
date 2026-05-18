namespace TaskManager.Api.Modules.Auth.Dtos;

public class UpdateProfileDto
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? DisplayName { get; set; }
    public string? AvatarUrl { get; set; }
}
