using FluentValidation;
using TaskManager.Api.Modules.Auth.Dtos;

namespace TaskManager.Api.Modules.Auth.Validators;

public class CreateApiTokenDtoValidator : AbstractValidator<CreateApiTokenDto>
{
    public CreateApiTokenDtoValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
    }
}
