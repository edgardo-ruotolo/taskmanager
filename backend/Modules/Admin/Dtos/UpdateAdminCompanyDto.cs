namespace TaskManager.Api.Modules.Admin.Dtos;

public class UpdateAdminCompanyDto
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public Guid? StateGroupId { get; set; }
}
