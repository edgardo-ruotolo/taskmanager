using FluentValidation;
using TaskManager.Api.Modules.Workspaces.Dtos;
using TaskManager.Api.Modules.Workspaces.Entities;

namespace TaskManager.Api.Modules.Workspaces.Validators;

public class CreateUserAndAddMemberDtoValidator : AbstractValidator<CreateUserAndAddMemberDto>
{
    public CreateUserAndAddMemberDtoValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(256);
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Password).NotEmpty().MinimumLength(8).MaximumLength(128);
        RuleFor(x => x.Role)
            .Must(IsAllowedRole)
            .WithMessage("Role must be Member, Lead or Admin.");
    }

    private static bool IsAllowedRole(WorkspaceRole role) =>
        role is WorkspaceRole.Member or WorkspaceRole.Lead or WorkspaceRole.Admin;
}
