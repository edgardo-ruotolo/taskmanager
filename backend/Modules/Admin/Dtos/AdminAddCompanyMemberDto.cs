namespace TaskManager.Api.Modules.Admin.Dtos;

public class AdminAddCompanyMemberDto
{
    public Guid UserId { get; set; }
    public string Role { get; set; } = "Member";
}
