using FluentValidation;
using TaskManager.Api.Modules.States.Dtos;

namespace TaskManager.Api.Modules.States.Validators;

public class CreateStateDtoValidator : AbstractValidator<CreateStateDto>
{
    public CreateStateDtoValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Color).NotEmpty().Matches("^#[0-9A-Fa-f]{6}$")
            .WithMessage("Color must be a valid hex color (e.g., #3b82f6).");
        RuleFor(x => x.StateGroupId).NotEmpty().WithMessage("StateGroupId es requerido.");
    }
}
