using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Filters;
using TaskManager.Api.Modules.Admin.Services;

namespace TaskManager.Api.Common.Filters;

/// <summary>
/// Automatically records an audit-log entry for every action executed under the
/// "Admin" role. Triggered as an MVC global action filter; runs after the action
/// completes successfully so we don't log noise from validation failures.
/// </summary>
public class AdminAuditFilter(IAdminAuditService auditService, ILogger<AdminAuditFilter> logger) : IAsyncActionFilter
{
    private const int MaxPayloadLength = 8_000;

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var executed = await next();

        try
        {
            if (executed.Exception is not null || executed.Canceled) return;

            // Only audit endpoints flagged as [Authorize(Roles="Admin")] or under [Authorize(Policy="AdminOnly")].
            var endpoint = context.HttpContext.GetEndpoint();
            var authorize = endpoint?.Metadata.OfType<AuthorizeAttribute>().FirstOrDefault();
            var isAdminRoute = authorize?.Roles?.Contains("Admin") == true
                || authorize?.Policy == "AdminOnly";
            if (!isAdminRoute) return;

            var http = context.HttpContext;
            var user = http.User;
            if (user.Identity?.IsAuthenticated != true) return;

            var actorIdClaim = user.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(actorIdClaim, out var actorId)) return;

            var routeValues = http.GetRouteData().Values;
            var targetId = routeValues.TryGetValue("id", out var idValue) ? idValue?.ToString()
                : routeValues.TryGetValue("userId", out var userValue) ? userValue?.ToString()
                : routeValues.TryGetValue("workspaceId", out var wsValue) ? wsValue?.ToString()
                : null;
            var targetType = routeValues.TryGetValue("controller", out var c) ? c?.ToString() : null;

            string? payload = null;
            try
            {
                payload = JsonSerializer.Serialize(context.ActionArguments);
                if (payload.Length > MaxPayloadLength)
                    payload = payload[..MaxPayloadLength];
            }
            catch
            {
                payload = "<unserializable>";
            }

            await auditService.RecordAsync(
                actorId: actorId,
                actorEmail: user.FindFirstValue(ClaimTypes.Email),
                action: $"{http.Request.Method} {http.Request.Path}",
                targetType: targetType,
                targetId: targetId,
                payload: payload,
                ipAddress: http.Connection.RemoteIpAddress?.ToString(),
                userAgent: http.Request.Headers.UserAgent.ToString(),
                ct: http.RequestAborted);
        }
        catch (Exception ex)
        {
            // Audit failures must never break the response — log and swallow.
            logger.LogWarning(ex, "Failed to record admin audit log entry");
        }
    }
}
