using FluentValidation;
using TaskManager.Api.Modules.Projects.Dtos;

namespace TaskManager.Api.Modules.Projects.Validators;

public class CreateProjectDtoValidator : AbstractValidator<CreateProjectDto>
{
    public CreateProjectDtoValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(255);
        RuleFor(x => x.Identifier).NotEmpty().MaximumLength(10)
            .Matches("^[A-Z0-9]+$").WithMessage("Identifier must be uppercase letters and numbers only.");
    }
}
