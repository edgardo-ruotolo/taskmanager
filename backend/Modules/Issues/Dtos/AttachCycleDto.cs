namespace TaskManager.Api.Modules.Issues.Dtos;

public class AttachCycleDto
{
    public Guid CycleId { get; set; }
}

public class AttachModulesDto
{
    public List<Guid> ModuleIds { get; set; } = [];
}
