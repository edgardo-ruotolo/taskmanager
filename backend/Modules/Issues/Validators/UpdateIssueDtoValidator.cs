using FluentValidation;
using TaskManager.Api.Modules.Issues.Dtos;

namespace TaskManager.Api.Modules.Issues.Validators;

public class UpdateIssueDtoValidator : AbstractValidator<UpdateIssueDto>
{
    public UpdateIssueDtoValidator()
    {
        RuleFor(x => x.Title).MaximumLength(500).When(x => x.Title is not null);
        RuleFor(x => x.SortOrder).GreaterThanOrEqualTo(0).When(x => x.SortOrder.HasValue);
        When(x => x.StartDate.HasValue && x.DueDate.HasValue, () =>
        {
            RuleFor(x => x.StartDate)
                .LessThanOrEqualTo(x => x.DueDate)
                .WithMessage("Start date must be before or equal to due date.");
        });
    }
}
