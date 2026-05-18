using FluentValidation;
using TaskManager.Api.Modules.Issues.Dtos;

namespace TaskManager.Api.Modules.Issues.Validators;

public class CreateIssueDtoValidator : AbstractValidator<CreateIssueDto>
{
    public CreateIssueDtoValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(500);
        RuleFor(x => x.StateId).NotEmpty();
    }
}
