using TaskManager.Api.Common.Auditing;
using TaskManager.Api.Modules.Auth.Entities;

namespace TaskManager.Api.Modules.Teams.Entities;

public class TeamMember : AuditableEntity
{
    public Guid TeamId { get; set; }
    public Team Team { get; set; } = null!;
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public string Role { get; set; } = "member"; // member | admin
}
