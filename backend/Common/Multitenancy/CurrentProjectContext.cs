namespace TaskManager.Api.Common.Multitenancy;

public class CurrentProjectContext : ICurrentProjectContext
{
    public Guid? ProjectId { get; private set; }

    public void SetProjectId(Guid projectId) => ProjectId = projectId;
}
