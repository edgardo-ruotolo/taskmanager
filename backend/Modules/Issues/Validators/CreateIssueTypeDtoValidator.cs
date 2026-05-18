using FluentValidation;
using TaskManager.Api.Modules.Issues.Dtos;

namespace TaskManager.Api.Modules.Issues.Validators;

public class CreateIssueTypeDtoValidator : AbstractValidator<CreateIssueTypeDto>
{
    public CreateIssueTypeDtoValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
    }
}
