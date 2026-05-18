using FluentValidation;
using TaskManager.Api.Modules.Workspaces.Dtos;

namespace TaskManager.Api.Modules.Workspaces.Validators;

public class CreateWorkspaceDtoValidator : AbstractValidator<CreateWorkspaceDto>
{
    public CreateWorkspaceDtoValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(255);
        RuleFor(x => x.Slug).NotEmpty().MaximumLength(100)
            .Matches("^[a-z0-9-]+$").WithMessage("Slug can only contain lowercase letters, numbers and hyphens.");
    }
}
