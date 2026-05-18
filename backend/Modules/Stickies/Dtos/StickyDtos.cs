namespace TaskManager.Api.Modules.Stickies.Dtos;

public class StickyDto
{
    public Guid Id { get; set; }
    public Guid WorkspaceId { get; set; }
    public Guid OwnedById { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Color { get; set; } = "yellow";
    public int SortOrder { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateStickyDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Color { get; set; } = "yellow";
}

public class UpdateStickyDto
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? Color { get; set; }
}

public class ReorderStickiesDto
{
    public List<Guid> OrderedIds { get; set; } = []; // IDs in desired order
}
