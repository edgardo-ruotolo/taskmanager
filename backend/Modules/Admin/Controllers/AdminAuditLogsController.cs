using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Api.Common.Pagination;
using TaskManager.Api.Modules.Admin.Dtos;
using TaskManager.Api.Modules.Admin.Services;

namespace TaskManager.Api.Modules.Admin.Controllers;

[ApiController]
[Authorize(Roles = "SuperAdmin")]
[Route("api/admin/audit-logs")]
public class AdminAuditLogsController(IAdminAuditService auditService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<AdminAuditLogDto>>> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken ct = default)
    {
        var result = await auditService.GetAllAsync(page, pageSize, ct);
        return Ok(result);
    }
}
