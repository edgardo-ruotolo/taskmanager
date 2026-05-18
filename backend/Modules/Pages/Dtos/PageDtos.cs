namespace TaskManager.Api.Modules.Pages.Dtos;

public class PageDto
{
    public Guid Id { get; set; }
    public Guid WorkspaceId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsLocked { get; set; }
    public bool IsArchived { get; set; }
    public Guid OwnedById { get; set; }
    public string OwnedByName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<Guid> LabelIds { get; set; } = [];
}

public class CreatePageDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<Guid> LabelIds { get; set; } = [];
}

public class UpdatePageDto
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public List<Guid>? LabelIds { get; set; }
}

public class PageVersionDto
{
    public Guid Id { get; set; }
    public Guid PageId { get; set; }
    public string Description { get; set; } = string.Empty;
    public Guid OwnedById { get; set; }
    public int VersionNumber { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class DuplicatePageDto
{
    public string Title { get; set; } = string.Empty;
}
