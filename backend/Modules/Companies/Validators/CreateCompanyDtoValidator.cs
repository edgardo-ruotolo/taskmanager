using FluentValidation;
using TaskManager.Api.Modules.Companies.Dtos;

namespace TaskManager.Api.Modules.Companies.Validators;

public class CreateCompanyDtoValidator : AbstractValidator<CreateCompanyDto>
{
    public CreateCompanyDtoValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(255);
        RuleFor(x => x.Identifier).NotEmpty().MaximumLength(10)
            .Matches("^[A-Z0-9]+$").WithMessage("Identifier must be uppercase letters and numbers only.");
    }
}
