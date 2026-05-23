using FluentValidation;
using TaskManager.Api.Modules.Modules.Dtos;

namespace TaskManager.Api.Modules.Modules.Validators;

public class CreateModuleDtoValidator : AbstractValidator<CreateModuleDto>
{
    public CreateModuleDtoValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(255);
    }
}
