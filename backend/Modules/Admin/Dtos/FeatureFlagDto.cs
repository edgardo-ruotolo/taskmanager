namespace TaskManager.Api.Modules.Admin.Dtos;

public class FeatureFlagDto
{
    public string Key { get; set; } = string.Empty;
    public bool Enabled { get; set; }
    public string? Description { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class UpdateFeatureFlagDto
{
    public bool Enabled { get; set; }
    public string? Description { get; set; }
}
