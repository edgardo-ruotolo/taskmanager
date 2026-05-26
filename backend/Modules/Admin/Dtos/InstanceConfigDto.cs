namespace TaskManager.Api.Modules.Admin.Dtos;

public class InstanceConfigDto
{
    public Guid Id { get; set; }
    public string InstanceName { get; set; } = "TaskManager";
    public bool IsSignUpEnabled { get; set; }
    public bool IsSetupDone { get; set; }
    public string? AdminEmail { get; set; }
    public string? BrevoFromEmail { get; set; }
    public string? BrevoFromName { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
