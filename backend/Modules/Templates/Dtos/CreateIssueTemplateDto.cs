namespace TaskManager.Api.Modules.Templates.Dtos;

public class CreateIssueTemplateDto
{
    public string Name { get; set; } = "";
    public string? Description { get; set; }
    public Guid? CompanyId { get; set; }
    public string? TemplateJson { get; set; }
}
