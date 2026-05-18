using FluentValidation;
using TaskManager.Api.Modules.Auth.Dtos;

namespace TaskManager.Api.Modules.Auth.Validators;

public class RegisterDtoValidator : AbstractValidator<RegisterDto>
{
    public RegisterDtoValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(256);
        RuleFor(x => x.Username).NotEmpty().MinimumLength(3).MaximumLength(50)
            .Matches("^[a-zA-Z0-9_-]+$").WithMessage("Username can only contain letters, numbers, hyphens and underscores.");
        RuleFor(x => x.Password).NotEmpty().MinimumLength(8).MaximumLength(100);
    }
}
