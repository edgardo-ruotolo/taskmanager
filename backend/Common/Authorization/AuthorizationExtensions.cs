using System.Security.Claims;

namespace TaskManager.Api.Common.Authorization;

public static class AuthorizationExtensions
{
    public const string SuperAdminRole = "SuperAdmin";

    public static bool IsSuperAdmin(this ClaimsPrincipal user) => user.IsInRole(SuperAdminRole);
}
