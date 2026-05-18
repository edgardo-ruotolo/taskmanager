namespace TaskManager.Api.Modules.Space.Dtos;

public class PublicSpaceIssueDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = "";
    public string? Priority { get; set; }
    public string? StateName { get; set; }
    public List<PublicSpaceAssigneeDto> Assignees { get; set; } = [];
}

public class PublicSpaceAssigneeDto
{
    public Guid UserId { get; set; }
    public string DisplayName { get; set; } = "";
    public string? AvatarUrl { get; set; }
}

public class PublicSpaceResponseDto
{
    public Guid Id { get; set; }
    public string Token { get; set; } = "";
    public string Title { get; set; } = "";
    public string? Description { get; set; }
    public bool ShowVoting { get; set; }
    public bool ShowComments { get; set; }
    public bool ShowPriority { get; set; }
    public bool ShowState { get; set; }
    public bool ShowAssignees { get; set; }
    public List<PublicSpaceIssueDto> Issues { get; set; } = [];
}
