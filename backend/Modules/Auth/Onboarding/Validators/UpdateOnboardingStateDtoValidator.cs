using FluentValidation;
using TaskManager.Api.Modules.Auth.Onboarding.Dtos;

namespace TaskManager.Api.Modules.Auth.Onboarding.Validators;

public class UpdateOnboardingStateDtoValidator : AbstractValidator<UpdateOnboardingStateDto>
{
    public UpdateOnboardingStateDtoValidator()
    {
        RuleFor(x => x.CompletedSteps).NotNull();
        RuleForEach(x => x.CompletedSteps)
            .NotEmpty()
            .MaximumLength(100)
            .Matches("^[a-zA-Z0-9_-]+$")
            .WithMessage("Step identifiers can only contain letters, numbers, hyphens and underscores.");
    }
}
