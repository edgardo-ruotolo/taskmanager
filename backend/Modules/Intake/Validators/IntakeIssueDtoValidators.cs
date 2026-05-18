using FluentValidation;
using TaskManager.Api.Modules.Intake.Dtos;

namespace TaskManager.Api.Modules.Intake.Validators;

public class CreateIntakeIssueDtoValidator : AbstractValidator<CreateIntakeIssueDto>
{
    public CreateIntakeIssueDtoValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(255);
        RuleFor(x => x.SubmitterEmail)
            .EmailAddress()
            .When(x => !string.IsNullOrWhiteSpace(x.SubmitterEmail));
    }
}

public class ReviewIntakeIssueDtoValidator : AbstractValidator<ReviewIntakeIssueDto>
{
    public ReviewIntakeIssueDtoValidator()
    {
        RuleFor(x => x.Status).IsInEnum();
        RuleFor(x => x.DeclineReason)
            .MaximumLength(1000)
            .When(x => x.DeclineReason is not null);
    }
}
