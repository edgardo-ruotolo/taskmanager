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
        RuleFor(x => x.ProjectIds)
            .NotEmpty()
            .WithMessage("Debe seleccionar al menos un proyecto.");
        RuleFor(x => x.StartsOn).NotEmpty();

        RuleFor(x => x.Timezone)
            .NotEmpty()
            .Must(tz =>
            {
                try { TimeZoneInfo.FindSystemTimeZoneById(tz); return true; }
                catch { return false; }
            })
            .WithMessage("Zona horaria inválida");

        // EndsOn debe ser estrictamente mayor que StartsOn (no se permite igualdad: una recurrencia
        // que termina el mismo día que empieza no tiene sentido funcional).
        When(x => !string.IsNullOrEmpty(x.EndsOn), () =>
        {
            RuleFor(x => x).Must(x =>
            {
                if (!DateOnly.TryParse(x.StartsOn, out var starts) ||
                    !DateOnly.TryParse(x.EndsOn, out var ends))
                    return true;
                return ends > starts;
            }).WithMessage("La fecha de fin debe ser posterior a la fecha de inicio.");
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

        // Weekly: requiere al menos un día seleccionado.
        When(x => x.Frequency == RecurringFrequency.Weekly, () =>
        {
            RuleFor(x => x.DaysOfWeek)
                .NotEmpty()
                .WithMessage("Selecciona al menos un día de la semana");
        });

        // Monthly: requiere DayOfMonth válido.
        When(x => x.Frequency == RecurringFrequency.Monthly, () =>
        {
            RuleFor(x => x.DayOfMonth)
                .NotNull().WithMessage("Debe indicar el día del mes.")
                .InclusiveBetween(1, 31).WithMessage("El día del mes debe estar entre 1 y 31.");
        });

        // Quarterly: requiere DayOfMonth válido.
        When(x => x.Frequency == RecurringFrequency.Quarterly, () =>
        {
            RuleFor(x => x.DayOfMonth)
                .NotNull().WithMessage("Debe indicar el día del mes.")
                .InclusiveBetween(1, 31).WithMessage("El día del mes debe estar entre 1 y 31.");
        });

        // Yearly: requiere DayOfMonth + MonthOfYear válidos.
        When(x => x.Frequency == RecurringFrequency.Yearly, () =>
        {
            RuleFor(x => x.DayOfMonth)
                .NotNull().WithMessage("Debe indicar el día del mes.")
                .InclusiveBetween(1, 31).WithMessage("El día del mes debe estar entre 1 y 31.");
            RuleFor(x => x.MonthOfYear)
                .NotNull().WithMessage("Debe indicar el mes del año.")
                .InclusiveBetween(1, 12).WithMessage("El mes del año debe estar entre 1 y 12.");
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
        When(x => x.ProjectIds != null, () =>
            RuleFor(x => x.ProjectIds!)
                .NotEmpty()
                .WithMessage("Debe seleccionar al menos un proyecto."));

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
                return ends > starts;
            }).WithMessage("La fecha de fin debe ser posterior a la fecha de inicio.");
        });

        When(x => x.Frequency == RecurringFrequency.Weekly && x.DaysOfWeek != null, () =>
        {
            RuleFor(x => x.DaysOfWeek!)
                .NotEmpty()
                .WithMessage("Selecciona al menos un día de la semana");
        });

        When(x => x.Frequency == RecurringFrequency.Monthly && x.DayOfMonth != null, () =>
        {
            RuleFor(x => x.DayOfMonth!.Value)
                .InclusiveBetween(1, 31)
                .WithMessage("El día del mes debe estar entre 1 y 31.");
        });

        When(x => x.Frequency == RecurringFrequency.Quarterly && x.DayOfMonth != null, () =>
        {
            RuleFor(x => x.DayOfMonth!.Value)
                .InclusiveBetween(1, 31)
                .WithMessage("El día del mes debe estar entre 1 y 31.");
        });

        When(x => x.Frequency == RecurringFrequency.Yearly, () =>
        {
            When(x => x.DayOfMonth != null, () =>
                RuleFor(x => x.DayOfMonth!.Value)
                    .InclusiveBetween(1, 31)
                    .WithMessage("El día del mes debe estar entre 1 y 31."));
            When(x => x.MonthOfYear != null, () =>
                RuleFor(x => x.MonthOfYear!.Value)
                    .InclusiveBetween(1, 12)
                    .WithMessage("El mes del año debe estar entre 1 y 12."));
        });
    }
}
