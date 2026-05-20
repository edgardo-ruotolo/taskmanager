using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Common.Auth;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Workspaces.Entities;

namespace TaskManager.Api.Common.Authorization;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class RequireWorkspaceAdminAttribute : Attribute, IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var currentUser = context.HttpContext.RequestServices.GetRequiredService<ICurrentUser>();
        if (!currentUser.IsAuthenticated)
        {
            context.Result = new UnauthorizedObjectResult("Authentication required.");
            return;
        }

        var workspaceSlug = context.RouteData.Values["workspaceSlug"]?.ToString();
        if (string.IsNullOrEmpty(workspaceSlug))
        {
            context.Result = new BadRequestObjectResult("Workspace slug is required.");
            return;
        }

        if (context.HttpContext.User.IsSuperAdmin())
        {
            context.HttpContext.Items["WorkspaceRole"] = WorkspaceRole.Admin;
            await next();
            return;
        }

        var db = context.HttpContext.RequestServices.GetRequiredService<AppDbContext>();
        var member = await db.WorkspaceMembers
            .Include(m => m.Workspace)
            .FirstOrDefaultAsync(m =>
                m.UserId == currentUser.UserId &&
                m.Workspace.Slug == workspaceSlug &&
                m.IsActive);

        if (member == null || member.Role != WorkspaceRole.Admin)
        {
            context.Result = new ForbidResult();
            return;
        }

        context.HttpContext.Items["WorkspaceRole"] = member.Role;
        await next();
    }
}
