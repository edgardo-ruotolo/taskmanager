using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Common.Auth;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Projects.Entities;

namespace TaskManager.Api.Common.Authorization;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class RequireProjectAdminAttribute : Attribute, IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var currentUser = context.HttpContext.RequestServices.GetRequiredService<ICurrentUser>();
        if (!currentUser.IsAuthenticated)
        {
            context.Result = new UnauthorizedObjectResult("Authentication required.");
            return;
        }

        if (!Guid.TryParse(context.RouteData.Values["projectId"]?.ToString(), out var projectId))
        {
            context.Result = new BadRequestObjectResult("Project ID is required.");
            return;
        }

        if (context.HttpContext.User.IsSuperAdmin())
        {
            context.HttpContext.Items["ProjectRole"] = ProjectRole.Admin;
            await next();
            return;
        }

        var db = context.HttpContext.RequestServices.GetRequiredService<AppDbContext>();
        var member = await db.ProjectMembers
            .FirstOrDefaultAsync(m =>
                m.UserId == currentUser.UserId &&
                m.ProjectId == projectId);

        if (member == null || member.Role != ProjectRole.Admin)
        {
            context.Result = new ForbidResult();
            return;
        }

        context.HttpContext.Items["ProjectRole"] = member.Role;
        await next();
    }
}
