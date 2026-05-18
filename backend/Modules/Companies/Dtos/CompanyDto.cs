namespace TaskManager.Api.Modules.Companies.Dtos;

public class CompanyDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Identifier { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? LogoUrl { get; set; }
    public Guid WorkspaceId { get; set; }
    public Guid OwnerId { get; set; }
    public DateTime CreatedAt { get; set; }
}
