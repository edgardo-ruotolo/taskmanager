using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Common.Auth;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Companies.Entities;

namespace TaskManager.Api.Common.Authorization;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class RequireCompanyAdminAttribute : Attribute, IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var currentUser = context.HttpContext.RequestServices.GetRequiredService<ICurrentUser>();
        if (!currentUser.IsAuthenticated)
        {
            context.Result = new UnauthorizedObjectResult("Authentication required.");
            return;
        }

        if (!Guid.TryParse(context.RouteData.Values["companyId"]?.ToString(), out var companyId))
        {
            context.Result = new BadRequestObjectResult("Company ID is required.");
            return;
        }

        var db = context.HttpContext.RequestServices.GetRequiredService<AppDbContext>();
        var member = await db.CompanyMembers
            .FirstOrDefaultAsync(m =>
                m.UserId == currentUser.UserId &&
                m.CompanyId == companyId);

        if (member == null || member.Role != CompanyRole.Admin)
        {
            context.Result = new ForbidResult();
            return;
        }

        context.HttpContext.Items["CompanyRole"] = member.Role;
        await next();
    }
}
