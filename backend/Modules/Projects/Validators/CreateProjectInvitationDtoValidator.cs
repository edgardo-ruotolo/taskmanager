using FluentValidation;
using TaskManager.Api.Modules.Projects.Dtos;
using TaskManager.Api.Modules.Projects.Entities;

namespace TaskManager.Api.Modules.Projects.Validators;

public class CreateProjectInvitationDtoValidator : AbstractValidator<CreateProjectInvitationDto>
{
    public CreateProjectInvitationDtoValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress()
            .MaximumLength(256);

        RuleFor(x => x.Role)
            .IsInEnum()
            .WithMessage("Role must be a valid project role.")
            .Must(role => role == ProjectRole.Member
                       || role == ProjectRole.Lead
                       || role == ProjectRole.Admin)
            .WithMessage("Role must be Member, Lead or Admin.");
    }
}
