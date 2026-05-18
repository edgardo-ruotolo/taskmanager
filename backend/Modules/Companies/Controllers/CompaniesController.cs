using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TaskManager.Api.Common.Pagination;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Companies.Dtos;
using TaskManager.Api.Modules.Companies.Services;
using TaskManager.Api.Modules.States.Dtos;

namespace TaskManager.Api.Modules.Companies.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/companies")]
[Authorize]
public class CompaniesController(ICompanyService companyService, AppDbContext db) : ControllerBase
{
    private Guid CurrentUserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpPost]
    public async Task<ActionResult<CompanyDto>> Create(string workspaceSlug, [FromBody] CreateCompanyDto dto, CancellationToken ct)
    {
        var company = await companyService.CreateAsync(workspaceSlug, CurrentUserId, dto, ct);
        return CreatedAtAction(nameof(GetById), new { workspaceSlug, companyId = company.Id }, company);
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<CompanyDto>>> GetAll(
        string workspaceSlug,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var result = await companyService.GetAllAsync(workspaceSlug, page, pageSize, ct);
        return Ok(result);
    }

    [HttpGet("{companyId:guid}")]
    public async Task<ActionResult<CompanyDto>> GetById(string workspaceSlug, Guid companyId, CancellationToken ct)
    {
        var company = await companyService.GetByIdAsync(workspaceSlug, companyId, ct);
        return Ok(company);
    }

    [HttpPatch("{companyId:guid}")]
    public async Task<ActionResult<CompanyDto>> Update(string workspaceSlug, Guid companyId, [FromBody] UpdateCompanyDto dto, CancellationToken ct)
    {
        var company = await companyService.UpdateAsync(workspaceSlug, companyId, CurrentUserId, dto, ct);
        return Ok(company);
    }

    [HttpDelete("{companyId:guid}")]
    public async Task<IActionResult> Delete(string workspaceSlug, Guid companyId, CancellationToken ct)
    {
        await companyService.DeleteAsync(workspaceSlug, companyId, CurrentUserId, ct);
        return NoContent();
    }

    // Members

    [HttpGet("{companyId:guid}/members")]
    public async Task<ActionResult<IEnumerable<CompanyMemberDto>>> GetMembers(string workspaceSlug, Guid companyId, CancellationToken ct)
    {
        var members = await companyService.GetMembersAsync(workspaceSlug, companyId, ct);
        return Ok(members);
    }

    [HttpDelete("{companyId:guid}/members/{userId:guid}")]
    public async Task<IActionResult> RemoveMember(string workspaceSlug, Guid companyId, Guid userId, CancellationToken ct)
    {
        await companyService.RemoveMemberAsync(workspaceSlug, companyId, userId, CurrentUserId, ct);
        return NoContent();
    }

    [HttpPatch("{companyId:guid}/members/{userId:guid}/role")]
    public async Task<ActionResult<CompanyMemberDto>> UpdateMemberRole(
        string workspaceSlug, Guid companyId, Guid userId, [FromBody] UpdateCompanyMemberRoleDto dto, CancellationToken ct)
    {
        var member = await companyService.UpdateMemberRoleAsync(workspaceSlug, companyId, userId, dto, CurrentUserId, ct);
        return Ok(member);
    }

    // Invitations

    [HttpGet("{companyId:guid}/invitations")]
    public async Task<ActionResult<IEnumerable<CompanyInvitationDto>>> GetPendingInvitations(string workspaceSlug, Guid companyId, CancellationToken ct)
    {
        var invitations = await companyService.GetPendingInvitationsAsync(workspaceSlug, companyId, ct);
        return Ok(invitations);
    }

    [HttpPost("{companyId:guid}/invitations")]
    public async Task<ActionResult<CompanyInvitationDto>> InviteMember(
        string workspaceSlug, Guid companyId, [FromBody] CreateCompanyInvitationDto dto, CancellationToken ct)
    {
        var invitation = await companyService.InviteMemberAsync(workspaceSlug, companyId, dto, CurrentUserId, ct);
        return Ok(invitation);
    }

    [HttpPost("{companyId:guid}/invitations/{token}/accept")]
    public async Task<IActionResult> AcceptInvitation(string workspaceSlug, Guid companyId, string token, CancellationToken ct)
    {
        await companyService.AcceptInvitationAsync(token, CurrentUserId, ct);
        return NoContent();
    }

    [HttpDelete("{companyId:guid}/invitations/{id:guid}")]
    public async Task<IActionResult> RevokeInvitation(string workspaceSlug, Guid companyId, Guid id, CancellationToken ct)
    {
        await companyService.RevokeInvitationAsync(id, CurrentUserId, ct);
        return NoContent();
    }

    [HttpGet("{companyId:guid}/states")]
    public async Task<ActionResult<IEnumerable<StateDto>>> GetCompanyStates(
        string workspaceSlug,
        Guid companyId,
        CancellationToken ct)
    {
        var company = await db.Companies
            .Where(c => c.Id == companyId)
            .Select(c => new { c.StateGroupId })
            .FirstOrDefaultAsync(ct);

        if (company is null) return NotFound();

        var states = await db.States
            .Where(s => s.StateGroupId == company.StateGroupId)
            .OrderBy(s => s.Sequence)
            .Select(s => new StateDto
            {
                Id = s.Id,
                Name = s.Name,
                Color = s.Color,
                Category = s.Category,
                Sequence = s.Sequence,
                IsDefault = s.IsDefault,
                StateGroupId = s.StateGroupId
            })
            .ToListAsync(ct);

        return Ok(states);
    }
}
