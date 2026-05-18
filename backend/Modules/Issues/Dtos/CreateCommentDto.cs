namespace TaskManager.Api.Modules.Issues.Dtos;

public class CreateCommentDto
{
    public string Body { get; set; } = "";
    public Guid? ParentId { get; set; }
}
