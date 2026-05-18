using FluentValidation;
using TaskManager.Api.Modules.Issues.Dtos;

namespace TaskManager.Api.Modules.Issues.Validators;

public class CreateIssueViewDtoValidator : AbstractValidator<CreateIssueViewDto>
{
    private static readonly string[] ValidLayouts = ["list", "kanban", "spreadsheet", "calendar", "gantt"];

    public CreateIssueViewDtoValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(255);
        RuleFor(x => x.Layout)
            .Must(l => ValidLayouts.Contains(l))
            .WithMessage("Layout must be one of: list, kanban, spreadsheet, calendar, gantt");
    }
}
