namespace TaskManager.Api.Modules.Admin.Dtos;

public class UpdateAdminUserDto
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? DisplayName { get; set; }
    public bool? IsActive { get; set; }
    public string? Role { get; set; }
}
