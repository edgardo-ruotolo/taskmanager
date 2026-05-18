using TaskManager.Api.Modules.Companies.Entities;

namespace TaskManager.Api.Modules.Companies.Dtos;

public class CreateCompanyInvitationDto
{
    public string Email { get; set; } = string.Empty;
    public CompanyRole Role { get; set; } = CompanyRole.Member;
}
