using FluentValidation;
using TaskManager.Api.Modules.Cycles.Dtos;

namespace TaskManager.Api.Modules.Cycles.Validators;

public class CreateCycleDtoValidator : AbstractValidator<CreateCycleDto>
{
    public CreateCycleDtoValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(255);
    }
}
