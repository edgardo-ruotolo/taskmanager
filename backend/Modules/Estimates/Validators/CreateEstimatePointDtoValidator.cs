using FluentValidation;
using TaskManager.Api.Modules.Estimates.Dtos;

namespace TaskManager.Api.Modules.Estimates.Validators;

public class CreateEstimatePointDtoValidator : AbstractValidator<CreateEstimatePointDto>
{
    public CreateEstimatePointDtoValidator()
    {
        RuleFor(x => x.Key).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Value).NotEmpty().MaximumLength(255);
    }
}
