using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Data;

namespace TaskManager.Api.Hubs;

[Authorize]
public class IssueHub(AppDbContext db) : Hub
{
    public async Task JoinIssueGroup(string issueId)
    {
        if (!Guid.TryParse(issueId, out var parsedIssueId)) return;
        var userId = GetUserId();
        if (userId is null) return;

        var issue = await db.Issues
            .AsNoTracking()
            .Where(i => i.Id == parsedIssueId)
            .Select(i => new { i.CompanyId, i.AssigneeId })
            .FirstOrDefaultAsync();

        if (issue is null) return;

        // Allow if user is the direct assignee or a member of the company that owns the issue.
        var hasAccess = issue.AssigneeId == userId
            || await db.CompanyMembers
                .AsNoTracking()
                .AnyAsync(m => m.CompanyId == issue.CompanyId && m.UserId == userId);

        if (!hasAccess) return;

        await Groups.AddToGroupAsync(Context.ConnectionId, $"issue:{parsedIssueId}");
    }

    public async Task LeaveIssueGroup(string issueId)
    {
        if (!Guid.TryParse(issueId, out var parsedIssueId)) return;
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"issue:{parsedIssueId}");
    }

    public async Task JoinCompanyGroup(string companyId)
    {
        if (!Guid.TryParse(companyId, out var parsedCompanyId)) return;
        var userId = GetUserId();
        if (userId is null) return;

        var isMember = await db.CompanyMembers
            .AsNoTracking()
            .AnyAsync(m => m.CompanyId == parsedCompanyId && m.UserId == userId);

        if (!isMember) return;

        await Groups.AddToGroupAsync(Context.ConnectionId, $"company:{parsedCompanyId}");
    }

    public async Task LeaveCompanyGroup(string companyId)
    {
        if (!Guid.TryParse(companyId, out var parsedCompanyId)) return;
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"company:{parsedCompanyId}");
    }

    private Guid? GetUserId()
    {
        var raw = Context.UserIdentifier;
        return Guid.TryParse(raw, out var id) ? id : null;
    }
}
