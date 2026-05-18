using FluentValidation;
using TaskManager.Api.Modules.Labels.Dtos;

namespace TaskManager.Api.Modules.Labels.Validators;

public class CreateLabelDtoValidator : AbstractValidator<CreateLabelDto>
{
    public CreateLabelDtoValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Color).NotEmpty().MaximumLength(7)
            .Matches(@"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")
            .WithMessage("Color must be a valid hex color (e.g. #RRGGBB or #RGB).");
    }
}
