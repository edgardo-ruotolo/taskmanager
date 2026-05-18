namespace TaskManager.Api.Modules.Admin.Dtos;

public class AdminCompanyDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Identifier { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid WorkspaceId { get; set; }
    public string WorkspaceName { get; set; } = string.Empty;
    public Guid OwnerId { get; set; }
    public int MemberCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public Guid StateGroupId { get; set; }
    public string StateGroupName { get; set; } = string.Empty;
}
