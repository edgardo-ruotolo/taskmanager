using FluentValidation;
using TaskManager.Api.Modules.Webhooks.Dtos;

namespace TaskManager.Api.Modules.Webhooks.Validators;

public class CreateWebhookDtoValidator : AbstractValidator<CreateWebhookDto>
{
    public CreateWebhookDtoValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(255);
        RuleFor(x => x.Url)
            .NotEmpty()
            .Must(url => Uri.TryCreate(url, UriKind.Absolute, out _))
            .WithMessage("Invalid URL");
    }
}
