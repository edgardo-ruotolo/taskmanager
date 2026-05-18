namespace TaskManager.Api.Modules.Issues.Dtos;

public class BulkArchiveDto
{
    public List<Guid> IssueIds { get; set; } = [];
}
