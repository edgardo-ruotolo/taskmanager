namespace TaskManager.Api.Modules.Space.Dtos;

public class DeployBoardDto
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public Guid WorkspaceId { get; set; }
    public string Token { get; set; } = "";
    public string Title { get; set; } = "";
    public string? Description { get; set; }
    public bool IsPublic { get; set; }
    public bool ShowVoting { get; set; }
    public bool ShowComments { get; set; }
    public bool ShowPriority { get; set; }
    public bool ShowState { get; set; }
    public bool ShowAssignees { get; set; }
    public int VisitCount { get; set; }
    public DateTime? LastVisitAt { get; set; }
    public string? Audience { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public int[] VisitHistory { get; set; } = Array.Empty<int>();
    public DateTime CreatedAt { get; set; }
}

public class CreateDeployBoardDto
{
    public string Title { get; set; } = "";
    public string? Description { get; set; }
    public bool ShowVoting { get; set; } = false;
    public bool ShowComments { get; set; } = false;
    public bool ShowPriority { get; set; } = true;
    public bool ShowState { get; set; } = true;
    public bool ShowAssignees { get; set; } = true;
}

public class UpdateDeployBoardDto
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public bool? IsPublic { get; set; }
    public bool? ShowVoting { get; set; }
    public bool? ShowComments { get; set; }
    public bool? ShowPriority { get; set; }
    public bool? ShowState { get; set; }
    public bool? ShowAssignees { get; set; }
    public string? Audience { get; set; }
    public DateTime? ExpiresAt { get; set; }
}
