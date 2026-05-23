using TaskManager.Api.Modules.Analytics.Dtos;
using TaskManager.Api.Modules.Issues.Entities;
using TaskManager.Api.Modules.States.Entities;

namespace TaskManager.Api.Modules.Analytics.Services;

public static class IssueFilterExtensions
{
    public static IQueryable<Issue> ApplyAnalyticsFilters(
        this IQueryable<Issue> query,
        AnalyticsFilters filters,
        Guid workspaceId)
    {
        query = query.Where(i => i.Project.WorkspaceId == workspaceId);

        if (!filters.IncludeArchived)
        {
            query = query.Where(i => !i.IsArchived);
        }

        if (filters.ProjectIds is { Count: > 0 } projectIds)
        {
            query = query.Where(i => projectIds.Contains(i.ProjectId));
        }

        if (filters.StateIds is { Count: > 0 } stateIds)
        {
            query = query.Where(i => stateIds.Contains(i.StateId));
        }

        if (filters.StateCategories is { Count: > 0 } stateCategoryNames)
        {
            var categories = stateCategoryNames
                .Select(s => Enum.TryParse<StateCategory>(s, ignoreCase: true, out var c) ? (StateCategory?)c : null)
                .Where(c => c.HasValue)
                .Select(c => c!.Value)
                .ToList();

            if (categories.Count > 0)
            {
                query = query.Where(i => categories.Contains(i.State.Category));
            }
        }

        if (filters.Priorities is { Count: > 0 } priorities)
        {
            query = query.Where(i => priorities.Contains(i.Priority));
        }

        if (filters.UserIds is { Count: > 0 } userIds)
        {
            query = query.Where(i =>
                (i.AssigneeId.HasValue && userIds.Contains(i.AssigneeId.Value)) ||
                i.Assignees.Any(a => userIds.Contains(a.UserId)));
        }

        if (filters.LabelIds is { Count: > 0 } labelIds)
        {
            query = query.Where(i => i.Labels.Any(l => labelIds.Contains(l.LabelId)));
        }

        if (filters.CycleId.HasValue)
        {
            var cycleId = filters.CycleId.Value;
            query = query.Where(i => i.CycleIssues.Any(ci => ci.CycleId == cycleId));
        }

        if (filters.DateFrom.HasValue || filters.DateTo.HasValue)
        {
            var field = (filters.DateField ?? "createdAt").ToLowerInvariant();

            if (filters.DateFrom.HasValue)
            {
                var from = DateTime.SpecifyKind(filters.DateFrom.Value, DateTimeKind.Utc);
                query = field switch
                {
                    "duedate" => query.Where(i => i.DueDate.HasValue && i.DueDate.Value >= from),
                    "completedat" => query.Where(i => i.CompletedAt.HasValue && i.CompletedAt.Value >= from),
                    _ => query.Where(i => i.CreatedAt >= from),
                };
            }

            if (filters.DateTo.HasValue)
            {
                var to = DateTime.SpecifyKind(filters.DateTo.Value, DateTimeKind.Utc);
                query = field switch
                {
                    "duedate" => query.Where(i => i.DueDate.HasValue && i.DueDate.Value <= to),
                    "completedat" => query.Where(i => i.CompletedAt.HasValue && i.CompletedAt.Value <= to),
                    _ => query.Where(i => i.CreatedAt <= to),
                };
            }
        }

        return query;
    }
}
