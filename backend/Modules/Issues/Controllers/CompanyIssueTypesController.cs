using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Common.Authorization;
using TaskManager.Api.Common.Exceptions;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Issues.Dtos;
using TaskManager.Api.Modules.Issues.Entities;

namespace TaskManager.Api.Modules.Issues.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/companies/{companyId:guid}/issue-types")]
[Authorize]
[ServiceFilter(typeof(RequireCompanyMemberAttribute))]
public class CompanyIssueTypesController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<IssueTypeDto>>> GetAll(
        string workspaceSlug, Guid companyId, CancellationToken ct)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var types = await db.CompanyIssueTypes
            .Include(cit => cit.IssueType)
            .Where(cit => cit.CompanyId == companyId && cit.Company.WorkspaceId == workspace.Id)
            .Select(cit => new IssueTypeDto
            {
                Id = cit.IssueType.Id,
                Name = cit.IssueType.Name,
                Description = cit.IssueType.Description,
                Color = cit.IssueType.Color,
                Icon = cit.IssueType.Icon,
                IsDefault = cit.IssueType.IsDefault,
                WorkspaceId = cit.IssueType.WorkspaceId
            })
            .ToListAsync(ct);

        return Ok(types);
    }

    [HttpPost]
    public async Task<IActionResult> Associate(
        string workspaceSlug, Guid companyId, [FromBody] AssociateIssueTypeDto dto, CancellationToken ct)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        _ = await db.Companies.FirstOrDefaultAsync(c => c.Id == companyId && c.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Company not found.");

        var issueType = await db.IssueTypes.FirstOrDefaultAsync(t => t.Id == dto.IssueTypeId && t.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("IssueType not found.");

        var exists = await db.CompanyIssueTypes.AnyAsync(cit => cit.CompanyId == companyId && cit.IssueTypeId == dto.IssueTypeId, ct);
        if (!exists)
        {
            db.CompanyIssueTypes.Add(new CompanyIssueType { CompanyId = companyId, IssueTypeId = dto.IssueTypeId });
            await db.SaveChangesAsync(ct);
        }

        return NoContent();
    }

    [HttpDelete("{issueTypeId:guid}")]
    public async Task<IActionResult> Dissociate(
        string workspaceSlug, Guid companyId, Guid issueTypeId, CancellationToken ct)
    {
        var entry = await db.CompanyIssueTypes
            .FirstOrDefaultAsync(cit => cit.CompanyId == companyId && cit.IssueTypeId == issueTypeId, ct)
            ?? throw new NotFoundException("Association not found.");

        db.CompanyIssueTypes.Remove(entry);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }
}
