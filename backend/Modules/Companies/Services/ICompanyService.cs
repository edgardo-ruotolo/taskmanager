using TaskManager.Api.Common.Pagination;
using TaskManager.Api.Modules.Companies.Dtos;

namespace TaskManager.Api.Modules.Companies.Services;

public interface ICompanyService
{
    Task<CompanyDto> CreateAsync(string workspaceSlug, Guid userId, CreateCompanyDto dto, CancellationToken ct = default);
    Task<PagedResult<CompanyDto>> GetAllAsync(string workspaceSlug, int page, int pageSize, CancellationToken ct = default);
    Task<CompanyDto> GetByIdAsync(string workspaceSlug, Guid companyId, CancellationToken ct = default);
    Task DeleteAsync(string workspaceSlug, Guid companyId, Guid userId, CancellationToken ct = default);
    Task<CompanyDto> UpdateAsync(string workspaceSlug, Guid companyId, Guid userId, UpdateCompanyDto dto, CancellationToken ct = default);

    // Members
    Task<IEnumerable<CompanyMemberDto>> GetMembersAsync(string workspaceSlug, Guid companyId, CancellationToken ct = default);
    Task RemoveMemberAsync(string workspaceSlug, Guid companyId, Guid userId, Guid requesterId, CancellationToken ct = default);
    Task<CompanyMemberDto> UpdateMemberRoleAsync(string workspaceSlug, Guid companyId, Guid userId, UpdateCompanyMemberRoleDto dto, Guid requesterId, CancellationToken ct = default);

    // Invitations
    Task<CompanyInvitationDto> InviteMemberAsync(string workspaceSlug, Guid companyId, CreateCompanyInvitationDto dto, Guid invitedById, CancellationToken ct = default);
    Task AcceptInvitationAsync(string token, Guid userId, CancellationToken ct = default);
    Task<IEnumerable<CompanyInvitationDto>> GetPendingInvitationsAsync(string workspaceSlug, Guid companyId, CancellationToken ct = default);
    Task RevokeInvitationAsync(Guid invitationId, Guid requesterId, CancellationToken ct = default);
}
