using FluentValidation;
using TaskManager.Api.Modules.Recurring.Dtos;
using TaskManager.Api.Modules.Recurring.Entities;

namespace TaskManager.Api.Modules.Recurring.Validators;

public class CreateRecurringTemplateDtoValidator : AbstractValidator<CreateRecurringTemplateDto>
{
    public CreateRecurringTemplateDtoValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(255);
        RuleFor(x => x.Frequency).IsInEnum();
        RuleFor(x => x.Interval).GreaterThanOrEqualTo(1);
        RuleFor(x => x.CompanyIds).NotEmpty().WithMessage("Selecciona al menos una empresa");
        RuleFor(x => x.StartsOn).NotEmpty();

        RuleFor(x => x.Timezone)
            .NotEmpty()
            .Must(tz =>
            {
                try { TimeZoneInfo.FindSystemTimeZoneById(tz); return true; }
                catch { return false; }
            })
            .WithMessage("Zona horaria inválida");

        When(x => !string.IsNullOrEmpty(x.EndsOn), () =>
        {
            RuleFor(x => x).Must(x =>
            {
                if (!DateOnly.TryParse(x.StartsOn, out var starts) ||
                    !DateOnly.TryParse(x.EndsOn, out var ends))
                    return true;
                return starts <= ends;
            }).WithMessage("StartsOn no puede ser posterior a EndsOn");
        });

        When(x => !string.IsNullOrEmpty(x.EndTime), () =>
        {
            RuleFor(x => x).Must(x =>
            {
                if (!TimeOnly.TryParse(x.RunAtTime, out var runAt) ||
                    !TimeOnly.TryParse(x.EndTime, out var endTime))
                    return true;
                return runAt < endTime;
            }).WithMessage("RunAtTime debe ser anterior a EndTime");
        });

        When(x => x.Frequency == RecurringFrequency.Weekly, () =>
        {
            RuleFor(x => x.DaysOfWeek)
                .NotEmpty()
                .WithMessage("Selecciona al menos un día de la semana");
        });
    }
}

public class UpdateRecurringTemplateDtoValidator : AbstractValidator<UpdateRecurringTemplateDto>
{
    public UpdateRecurringTemplateDtoValidator()
    {
        When(x => x.Name != null, () => RuleFor(x => x.Name!).NotEmpty().MaximumLength(255));
        When(x => x.Frequency != null, () => RuleFor(x => x.Frequency!.Value).IsInEnum());
        When(x => x.Interval != null, () => RuleFor(x => x.Interval!.Value).GreaterThanOrEqualTo(1));
        When(x => x.CompanyIds != null, () => RuleFor(x => x.CompanyIds!).NotEmpty().WithMessage("Selecciona al menos una empresa"));

        When(x => x.Timezone != null, () =>
        {
            RuleFor(x => x.Timezone!)
                .NotEmpty()
                .Must(tz =>
                {
                    try { TimeZoneInfo.FindSystemTimeZoneById(tz); return true; }
                    catch { return false; }
                })
                .WithMessage("Zona horaria inválida");
        });

        When(x => !string.IsNullOrEmpty(x.EndsOn) && !string.IsNullOrEmpty(x.StartsOn), () =>
        {
            RuleFor(x => x).Must(x =>
            {
                if (!DateOnly.TryParse(x.StartsOn, out var starts) ||
                    !DateOnly.TryParse(x.EndsOn, out var ends))
                    return true;
                return starts <= ends;
            }).WithMessage("StartsOn no puede ser posterior a EndsOn");
        });

        When(x => x.Frequency == RecurringFrequency.Weekly && x.DaysOfWeek != null, () =>
        {
            RuleFor(x => x.DaysOfWeek!)
                .NotEmpty()
                .WithMessage("Selecciona al menos un día de la semana");
        });
    }
}
