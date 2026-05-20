using TaskManager.Api.Modules.Issues.Dtos;
using TaskManager.Api.Modules.Issues.Entities;

namespace TaskManager.Api.Modules.Issues.Services;

internal static class IssueMapper
{
    public static IssueDto MapToDto(Issue issue) => new()
    {
        Id = issue.Id,
        SequenceId = issue.SequenceId,
        Title = issue.Title,
        Description = issue.Description,
        DescriptionHtml = issue.DescriptionHtml,
        DescriptionJson = issue.DescriptionJson,
        Priority = issue.Priority,
        CompanyId = issue.CompanyId,
        StateId = issue.StateId,
        StateName = issue.State?.Name ?? string.Empty,
        StateColor = issue.State?.Color ?? string.Empty,
        StateGroup = issue.State?.Category.ToString(),
        CreatedById = issue.CreatedById,
        UpdatedById = issue.UpdatedById,
        AssigneeId = issue.AssigneeId,
        AssigneeIds = issue.Assignees.Select(a => a.UserId).ToList(),
        LabelIds = issue.Labels.Select(l => l.LabelId).ToList(),
        ModuleIds = issue.ModuleIssues.Select(mi => mi.ModuleId).ToList(),
        CycleId = issue.CycleIssues.FirstOrDefault()?.CycleId,
        ParentId = issue.ParentId,
        IssueTypeId = issue.IssueTypeId,
        EstimatePointId = issue.EstimatePointId,
        Point = issue.Point,
        StartDate = issue.StartDate,
        DueDate = issue.DueDate,
        CompletedAt = issue.CompletedAt,
        SortOrder = issue.SortOrder,
        IsDraft = issue.IsDraft,
        IsArchived = issue.IsArchived,
        ArchivedAt = issue.ArchivedAt,
        ExternalSource = issue.ExternalSource,
        ExternalId = issue.ExternalId,
        RequiresAdminApproval = issue.RequiresAdminApproval,
        ApprovalRequiredStateIds = issue.ApprovalRequiredStateIds,
        ApprovedById = issue.ApprovedById,
        ApprovedAt = issue.ApprovedAt,
        CreatedAt = issue.CreatedAt,
        UpdatedAt = issue.UpdatedAt
    };
}
