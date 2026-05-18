using FluentValidation;
using TaskManager.Api.Modules.Auth.Dtos;

namespace TaskManager.Api.Modules.Auth.Validators;

public class UpdateProfileDtoValidator : AbstractValidator<UpdateProfileDto>
{
    public UpdateProfileDtoValidator()
    {
        When(x => x.FirstName != null, () =>
            RuleFor(x => x.FirstName).MaximumLength(100));

        When(x => x.LastName != null, () =>
            RuleFor(x => x.LastName).MaximumLength(100));

        When(x => x.DisplayName != null, () =>
            RuleFor(x => x.DisplayName).MaximumLength(150));
    }
}
