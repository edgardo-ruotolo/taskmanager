using TaskManager.Api.Common.Auditing;
using TaskManager.Api.Modules.Auth.Entities;

namespace TaskManager.Api.Modules.Issues.Entities;

public class IssueComment : AuditableEntity
{
    public string Body { get; set; } = "";
    public Guid IssueId { get; set; }
    public Issue Issue { get; set; } = null!;
    public Guid AuthorId { get; set; }
    public User Author { get; set; } = null!;
    public Guid? ParentId { get; set; }
    public IssueComment? Parent { get; set; }
    public ICollection<IssueComment> Replies { get; set; } = [];
    public ICollection<CommentReaction> Reactions { get; set; } = [];
}
