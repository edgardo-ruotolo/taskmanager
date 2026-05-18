using FluentValidation;
using TaskManager.Api.Modules.ProjectModules.Dtos;

namespace TaskManager.Api.Modules.ProjectModules.Validators;

public class CreateProjectModuleDtoValidator : AbstractValidator<CreateProjectModuleDto>
{
    public CreateProjectModuleDtoValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(255);
    }
}
