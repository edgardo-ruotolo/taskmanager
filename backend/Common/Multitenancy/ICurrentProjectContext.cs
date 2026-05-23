namespace TaskManager.Api.Common.Multitenancy;

public interface ICurrentProjectContext
{
    Guid? ProjectId { get; }
    void SetProjectId(Guid projectId);
}
