using FluentValidation;
using TaskManager.Api.Modules.Issues.Dtos;

namespace TaskManager.Api.Modules.Issues.Validators;

public class UpdateIssueDtoValidator : AbstractValidator<UpdateIssueDto>
{
    public UpdateIssueDtoValidator()
    {
        RuleFor(x => x.Title).MaximumLength(500).When(x => x.Title is not null);
    }
}
