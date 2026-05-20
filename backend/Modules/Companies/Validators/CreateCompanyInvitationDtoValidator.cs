using FluentValidation;
using TaskManager.Api.Modules.Companies.Dtos;
using TaskManager.Api.Modules.Companies.Entities;

namespace TaskManager.Api.Modules.Companies.Validators;

public class CreateCompanyInvitationDtoValidator : AbstractValidator<CreateCompanyInvitationDto>
{
    public CreateCompanyInvitationDtoValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress()
            .MaximumLength(256);

        RuleFor(x => x.Role)
            .IsInEnum()
            .WithMessage("Role must be a valid company role.")
            .Must(role => role == CompanyRole.Guest
                       || role == CompanyRole.Member
                       || role == CompanyRole.Lead
                       || role == CompanyRole.Admin)
            .WithMessage("Role must be Guest, Member, Lead or Admin.");
    }
}
