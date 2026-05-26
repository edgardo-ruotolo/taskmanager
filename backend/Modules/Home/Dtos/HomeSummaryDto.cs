namespace TaskManager.Api.Modules.Home.Dtos;

public class HomeSummaryStatsDto
{
    public int AssignedToMe { get; set; }
    public int ToReview { get; set; }
    public int DueToday { get; set; }
    public int DoneThisWeek { get; set; }
}

public class HomeSummaryTodayIssueDto
{
    public Guid Id { get; set; }
    public string Identifier { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string StateColor { get; set; } = string.Empty;
    public string StateGroup { get; set; } = string.Empty;
    public DateTime? DueDate { get; set; }
    public string? CycleName { get; set; }
    public string? AssigneeName { get; set; }
}

public class HomeSummaryActiveCycleDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int CompletedIssues { get; set; }
    public int TotalIssues { get; set; }
    public int ProgressPercent { get; set; }
}

public class HomeSummaryDto
{
    public HomeSummaryStatsDto Stats { get; set; } = new();
    public List<HomeSummaryTodayIssueDto> TodayIssues { get; set; } = new();
    public List<HomeSummaryActiveCycleDto> ActiveCycles { get; set; } = new();
}
