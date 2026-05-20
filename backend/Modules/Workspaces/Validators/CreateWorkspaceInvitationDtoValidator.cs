using FluentValidation;
using TaskManager.Api.Modules.Workspaces.Dtos;
using TaskManager.Api.Modules.Workspaces.Entities;

namespace TaskManager.Api.Modules.Workspaces.Validators;

public class CreateWorkspaceInvitationDtoValidator : AbstractValidator<CreateWorkspaceInvitationDto>
{
    public CreateWorkspaceInvitationDtoValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress()
            .MaximumLength(256);

        RuleFor(x => x.Role)
            .IsInEnum()
            .WithMessage("Role must be a valid workspace role.")
            .Must(role => role == WorkspaceRole.Guest || role == WorkspaceRole.Member || role == WorkspaceRole.Admin)
            .WithMessage("Role must be Guest, Member or Admin.");
    }
}
