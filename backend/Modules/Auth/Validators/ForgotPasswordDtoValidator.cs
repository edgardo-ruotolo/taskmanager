using FluentValidation;
using TaskManager.Api.Modules.Auth.Dtos;

namespace TaskManager.Api.Modules.Auth.Validators;

public class ForgotPasswordDtoValidator : AbstractValidator<ForgotPasswordDto>
{
    public ForgotPasswordDtoValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
    }
}
