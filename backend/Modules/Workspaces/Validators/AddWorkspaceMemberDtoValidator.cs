using FluentValidation;
using TaskManager.Api.Modules.Workspaces.Dtos;
using TaskManager.Api.Modules.Workspaces.Entities;

namespace TaskManager.Api.Modules.Workspaces.Validators;

public class AddWorkspaceMemberDtoValidator : AbstractValidator<AddWorkspaceMemberDto>
{
    public AddWorkspaceMemberDtoValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.Role)
            .Must(IsAllowedRole)
            .WithMessage("Role must be Member, Lead or Admin.");
    }

    private static bool IsAllowedRole(WorkspaceRole role) =>
        role is WorkspaceRole.Member or WorkspaceRole.Lead or WorkspaceRole.Admin;
}
