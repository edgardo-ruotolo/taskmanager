using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace TaskManager.Api.Hubs;

[Authorize]
public class IssueHub : Hub
{
    public async Task JoinIssueGroup(string issueId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"issue:{issueId}");
    }

    public async Task LeaveIssueGroup(string issueId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"issue:{issueId}");
    }

    public async Task JoinCompanyGroup(string companyId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"company:{companyId}");
    }

    public async Task LeaveCompanyGroup(string companyId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"company:{companyId}");
    }
}
