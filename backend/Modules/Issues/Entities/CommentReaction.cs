using TaskManager.Api.Common.Auditing;
using TaskManager.Api.Modules.Auth.Entities;

namespace TaskManager.Api.Modules.Issues.Entities;

public class CommentReaction : AuditableEntity
{
    public string Emoji { get; set; } = "";
    public Guid CommentId { get; set; }
    public IssueComment Comment { get; set; } = null!;
    public Guid ActorId { get; set; }
    public User Actor { get; set; } = null!;
}
