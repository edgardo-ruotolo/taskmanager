namespace TaskManager.Api.Modules.Issues.Dtos;

public class BulkDeleteDto
{
    public List<Guid> IssueIds { get; set; } = [];
}
