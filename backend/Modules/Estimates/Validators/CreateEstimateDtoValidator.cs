using FluentValidation;
using TaskManager.Api.Modules.Estimates.Dtos;

namespace TaskManager.Api.Modules.Estimates.Validators;

public class CreateEstimateDtoValidator : AbstractValidator<CreateEstimateDto>
{
    public CreateEstimateDtoValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(255);
    }
}
