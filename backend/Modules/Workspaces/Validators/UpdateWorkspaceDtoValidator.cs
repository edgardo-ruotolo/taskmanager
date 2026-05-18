using FluentValidation;
using TaskManager.Api.Modules.Workspaces.Dtos;

namespace TaskManager.Api.Modules.Workspaces.Validators;

public class UpdateWorkspaceDtoValidator : AbstractValidator<UpdateWorkspaceDto>
{
    public UpdateWorkspaceDtoValidator()
    {
        RuleFor(x => x.Name).MaximumLength(255).When(x => x.Name != null);
        RuleFor(x => x.Description).MaximumLength(1000).When(x => x.Description != null);
        RuleFor(x => x.LogoUrl).MaximumLength(500).When(x => x.LogoUrl != null);
    }
}
