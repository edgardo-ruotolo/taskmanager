using TaskManager.Api.Modules.Issues.Dtos;
using TaskManager.Api.Modules.Issues.Entities;
using TaskManager.Api.Modules.States.Entities;

namespace TaskManager.Api.Modules.Issues.Services;

internal static class IssueMapper
{
    public static IssueDto MapToDto(Issue issue)
    {
        var assigneeName = BuildDisplayName(
            issue.Assignee?.DisplayName,
            issue.Assignee?.FirstName,
            issue.Assignee?.LastName,
            issue.Assignee?.UserName,
            issue.Assignee?.Email);

        var createdByName = BuildDisplayName(
            issue.CreatedBy?.DisplayName,
            issue.CreatedBy?.FirstName,
            issue.CreatedBy?.LastName,
            issue.CreatedBy?.UserName,
            issue.CreatedBy?.Email);

        var subIssues = issue.SubIssues ?? new List<Issue>();
        var subIssueCount = subIssues.Count;
        var subIssueCompletedCount = subIssues.Count(s =>
            s.State != null &&
            (s.State.Category == StateCategory.Completed || s.State.Category == StateCategory.Cancelled));

        var cycleIssue = issue.CycleIssues?.FirstOrDefault();

        return new IssueDto
        {
            Id = issue.Id,
            SequenceId = issue.SequenceId,
            Title = issue.Title,
            Description = issue.Description,
            DescriptionHtml = issue.DescriptionHtml,
            DescriptionJson = issue.DescriptionJson,
            Priority = issue.Priority,
            ProjectId = issue.ProjectId,
            StateId = issue.StateId,
            StateName = issue.State?.Name ?? string.Empty,
            StateColor = issue.State?.Color ?? string.Empty,
            StateGroup = issue.State?.Category.ToString(),
            CreatedById = issue.CreatedById,
            CreatedByName = createdByName,
            UpdatedById = issue.UpdatedById,
            AssigneeId = issue.AssigneeId,
            AssigneeName = assigneeName,
            AssigneeAvatarUrl = issue.Assignee?.AvatarUrl,
            AssigneeIds = issue.Assignees.Select(a => a.UserId).ToList(),
            LabelIds = issue.Labels.Select(l => l.LabelId).ToList(),
            ModuleIds = issue.ModuleIssues.Select(mi => mi.ModuleId).ToList(),
            CycleId = cycleIssue?.CycleId,
            CycleName = cycleIssue?.Cycle?.Name,
            ParentId = issue.ParentId,
            SubIssueCount = subIssueCount,
            SubIssueCompletedCount = subIssueCompletedCount,
            IssueTypeId = issue.IssueTypeId,
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

    private static string? BuildDisplayName(string? displayName, string? firstName, string? lastName, string? userName, string? email)
    {
        if (!string.IsNullOrWhiteSpace(displayName)) return displayName;
        var composed = $"{firstName} {lastName}".Trim();
        if (!string.IsNullOrWhiteSpace(composed)) return composed;
        if (!string.IsNullOrWhiteSpace(userName)) return userName;
        return email;
    }
}
