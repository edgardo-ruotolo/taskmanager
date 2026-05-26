using TaskManager.Api.Modules.Issues.Entities;

namespace TaskManager.Api.Modules.Issues.Dtos;

public class AiDependencyDto
{
    public Guid IssueId { get; set; }
    public string Identifier { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string StateColor { get; set; } = string.Empty;
    public IssueRelationType RelationType { get; set; }
    public string DetectedBy { get; set; } = "manual";
}

public class AiDependenciesDto
{
    public List<AiDependencyDto> Dependencies { get; set; } = new();
}
