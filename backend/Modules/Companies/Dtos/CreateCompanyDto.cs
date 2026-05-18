namespace TaskManager.Api.Modules.Companies.Dtos;

public class CreateCompanyDto
{
    public string Name { get; set; } = string.Empty;
    public string Identifier { get; set; } = string.Empty;
    public string? Description { get; set; }
}
