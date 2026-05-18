using TaskManager.Api.Common.Auditing;
using TaskManager.Api.Modules.Auth.Entities;
using TaskManager.Api.Modules.Workspaces.Entities;

namespace TaskManager.Api.Modules.Files.Entities;

public class FileAsset : AuditableEntity
{
    public string FileName { get; set; } = "";
    public string StoragePath { get; set; } = "";
    public string ContentType { get; set; } = "";
    public long SizeBytes { get; set; }
    public string? EntityType { get; set; }
    public string? EntityId { get; set; }
    public Guid UploadedById { get; set; }
    public User UploadedBy { get; set; } = null!;
    public Guid WorkspaceId { get; set; }
    public Workspace Workspace { get; set; } = null!;
}
