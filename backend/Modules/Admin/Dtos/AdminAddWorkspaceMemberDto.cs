namespace TaskManager.Api.Modules.Admin.Dtos;

public class AdminAddWorkspaceMemberDto
{
    public Guid UserId { get; set; }
    public string Role { get; set; } = "Member";
}
