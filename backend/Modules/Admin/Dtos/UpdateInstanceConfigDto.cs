namespace TaskManager.Api.Modules.Admin.Dtos;

public class UpdateInstanceConfigDto
{
    public string? InstanceName { get; set; }
    public bool? IsSignUpEnabled { get; set; }
    public string? AdminEmail { get; set; }
    public string? BrevoApiKey { get; set; }
    public string? CloudinaryCloudName { get; set; }
    public string? CloudinaryApiKey { get; set; }
    public string? CloudinaryApiSecret { get; set; }
}
