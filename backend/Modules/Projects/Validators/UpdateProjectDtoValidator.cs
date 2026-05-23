using FluentValidation;
using TaskManager.Api.Modules.Projects.Dtos;

namespace TaskManager.Api.Modules.Projects.Validators;

public class UpdateProjectDtoValidator : AbstractValidator<UpdateProjectDto>
{
    public UpdateProjectDtoValidator()
    {
        RuleFor(x => x.Name).MaximumLength(255).When(x => x.Name != null);
        RuleFor(x => x.Description).MaximumLength(1000).When(x => x.Description != null);
        RuleFor(x => x.LogoUrl).MaximumLength(500).When(x => x.LogoUrl != null);
    }
}
