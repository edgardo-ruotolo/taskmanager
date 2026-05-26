using FluentValidation;
using TaskManager.Api.Modules.Issues.Dtos;

namespace TaskManager.Api.Modules.Issues.Validators;

public class CreateIssueDtoValidator : AbstractValidator<CreateIssueDto>
{
    public CreateIssueDtoValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(500);
        RuleFor(x => x.StateId).NotEmpty();
        RuleFor(x => x.SortOrder).GreaterThanOrEqualTo(0);
        RuleForEach(x => x.AssigneeIds).NotEqual(Guid.Empty);
        RuleForEach(x => x.LabelIds).NotEqual(Guid.Empty);
        RuleForEach(x => x.ModuleIds).NotEqual(Guid.Empty);
        When(x => x.ParentId.HasValue, () =>
        {
            RuleFor(x => x.ParentId!.Value)
                .NotEqual(Guid.Empty)
                .WithMessage("ParentId must be a valid GUID.");
        });
        When(x => x.StartDate.HasValue && x.DueDate.HasValue, () =>
        {
            RuleFor(x => x.StartDate)
                .LessThanOrEqualTo(x => x.DueDate)
                .WithMessage("Start date must be before or equal to due date.");
        });
        When(x => x.RequiresAdminApproval, () =>
        {
            RuleFor(x => x.ApprovalRequiredStateIds)
                .NotEmpty()
                .WithMessage("Selecciona al menos un estado que requiera aprobación.");
        });
    }
}
