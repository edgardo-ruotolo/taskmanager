namespace TaskManager.Api.Modules.Issues.Dtos;

public class IssueCommentDto
{
    public Guid Id { get; set; }
    public string Body { get; set; } = "";
    public Guid IssueId { get; set; }
    public Guid AuthorId { get; set; }
    public string AuthorName { get; set; } = "";
    public Guid? ParentId { get; set; }
    public string Access { get; set; } = "Internal";
    public DateTime? EditedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
