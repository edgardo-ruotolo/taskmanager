using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Common.Exceptions;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Auth.Entities;
using TaskManager.Api.Modules.Cycles.Entities;
using TaskManager.Api.Modules.Home.Dtos;
using TaskManager.Api.Modules.States.Entities;

namespace TaskManager.Api.Modules.Home.Services;

public class HomeSummaryService(AppDbContext db) : IHomeSummaryService
{
    public async Task<HomeSummaryDto> GetSummaryAsync(string workspaceSlug, Guid userId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.AsNoTracking()
            .FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var today = DateTime.UtcNow.Date;
        var tomorrow = today.AddDays(1);
        var weekAgo = today.AddDays(-7);

        var incompleteCategories = new[] { StateCategory.Backlog, StateCategory.Unstarted, StateCategory.Started };

        var workspaceIssues = db.Issues
            .AsNoTracking()
            .Where(i => i.Project.WorkspaceId == workspace.Id);

        var assignedToMe = await workspaceIssues
            .Where(i => i.Assignees.Any(a => a.UserId == userId)
                && incompleteCategories.Contains(i.State.Category))
            .CountAsync(ct);

        // Simplification: "to review" = issues in Unstarted category assigned to current user.
        var toReview = await workspaceIssues
            .Where(i => i.Assignees.Any(a => a.UserId == userId)
                && i.State.Category == StateCategory.Unstarted)
            .CountAsync(ct);

        var dueToday = await workspaceIssues
            .Where(i => i.Assignees.Any(a => a.UserId == userId)
                && i.DueDate != null
                && i.DueDate >= today
                && i.DueDate < tomorrow)
            .CountAsync(ct);

        var doneThisWeek = await workspaceIssues
            .Where(i => i.Assignees.Any(a => a.UserId == userId)
                && i.State.Category == StateCategory.Completed
                && i.UpdatedAt >= weekAgo)
            .CountAsync(ct);

        var todayIssuesRaw = await workspaceIssues
            .Where(i => i.Assignees.Any(a => a.UserId == userId)
                && i.DueDate != null
                && i.DueDate <= today
                && incompleteCategories.Contains(i.State.Category))
            .OrderBy(i => i.DueDate)
            .Take(10)
            .Select(i => new
            {
                i.Id,
                i.SequenceId,
                i.Title,
                i.DueDate,
                StateColor = i.State.Color,
                StateCategory = i.State.Category,
                ProjectIdentifier = i.Project.Identifier,
                CycleName = i.CycleIssues
                    .Select(ci => ci.Cycle.Name)
                    .FirstOrDefault(),
                AssigneeDisplayName = i.Assignees
                    .Select(a => a.User.DisplayName)
                    .FirstOrDefault(),
                AssigneeFirstName = i.Assignees
                    .Select(a => a.User.FirstName)
                    .FirstOrDefault(),
                AssigneeLastName = i.Assignees
                    .Select(a => a.User.LastName)
                    .FirstOrDefault(),
                AssigneeUserName = i.Assignees
                    .Select(a => a.User.UserName)
                    .FirstOrDefault(),
                AssigneeEmail = i.Assignees
                    .Select(a => a.User.Email)
                    .FirstOrDefault()
            })
            .ToListAsync(ct);

        var todayIssues = todayIssuesRaw
            .Select(i => new HomeSummaryTodayIssueDto
            {
                Id = i.Id,
                Identifier = $"{i.ProjectIdentifier}-{i.SequenceId}",
                Title = i.Title,
                StateColor = i.StateColor,
                StateGroup = MapStateGroup(i.StateCategory),
                DueDate = i.DueDate,
                CycleName = i.CycleName,
                AssigneeName = BuildAssigneeName(i.AssigneeDisplayName, i.AssigneeFirstName, i.AssigneeLastName, i.AssigneeUserName, i.AssigneeEmail)
            })
            .ToList();

        var activeCyclesRaw = await db.Cycles
            .AsNoTracking()
            .Where(c => c.Project.WorkspaceId == workspace.Id
                && (c.Status == CycleStatus.Started
                    || (c.StartDate != null && c.EndDate != null && c.StartDate <= today && c.EndDate >= today)))
            .OrderBy(c => c.StartDate)
            .Take(5)
            .Select(c => new
            {
                c.Id,
                c.Name,
                c.StartDate,
                c.EndDate,
                TotalIssues = c.CycleIssues.Count,
                CompletedIssues = c.CycleIssues
                    .Count(ci => ci.Issue.State.Category == StateCategory.Completed
                        || ci.Issue.State.Category == StateCategory.Cancelled)
            })
            .ToListAsync(ct);

        var activeCycles = activeCyclesRaw
            .Select(c => new HomeSummaryActiveCycleDto
            {
                Id = c.Id,
                Name = c.Name,
                StartDate = c.StartDate,
                EndDate = c.EndDate,
                CompletedIssues = c.CompletedIssues,
                TotalIssues = c.TotalIssues,
                ProgressPercent = c.TotalIssues == 0
                    ? 0
                    : (int)Math.Round((double)c.CompletedIssues / c.TotalIssues * 100)
            })
            .ToList();

        return new HomeSummaryDto
        {
            Stats = new HomeSummaryStatsDto
            {
                AssignedToMe = assignedToMe,
                ToReview = toReview,
                DueToday = dueToday,
                DoneThisWeek = doneThisWeek
            },
            TodayIssues = todayIssues,
            ActiveCycles = activeCycles
        };
    }

    private static string MapStateGroup(StateCategory category) => category switch
    {
        StateCategory.Backlog => "backlog",
        StateCategory.Unstarted => "unstarted",
        StateCategory.Started => "started",
        StateCategory.Completed => "completed",
        StateCategory.Cancelled => "cancelled",
        _ => "unstarted"
    };

    private static string? BuildAssigneeName(string? displayName, string? firstName, string? lastName, string? userName, string? email)
    {
        if (!string.IsNullOrWhiteSpace(displayName)) return displayName;
        var composed = $"{firstName} {lastName}".Trim();
        if (!string.IsNullOrWhiteSpace(composed)) return composed;
        if (!string.IsNullOrWhiteSpace(userName)) return userName;
        return email;
    }
}
