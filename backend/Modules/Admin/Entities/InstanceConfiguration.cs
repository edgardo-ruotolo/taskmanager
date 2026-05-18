using TaskManager.Api.Common.Auditing;

namespace TaskManager.Api.Modules.Admin.Entities;

public class InstanceConfiguration : AuditableEntity
{
    public string InstanceName { get; set; } = "TaskManager";
    public bool IsSignUpEnabled { get; set; } = true;
    public bool IsSetupDone { get; set; } = false;
    public string? AdminEmail { get; set; }
    public string? BrevoApiKey { get; set; }
    public string? CloudinaryCloudName { get; set; }
    public string? CloudinaryApiKey { get; set; }
    public string? CloudinaryApiSecret { get; set; }
}
