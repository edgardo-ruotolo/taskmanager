using FluentValidation;
using TaskManager.Api.Modules.Issues.Dtos;

namespace TaskManager.Api.Modules.Issues.Validators;

public class CreateReactionDtoValidator : AbstractValidator<CreateReactionDto>
{
    public CreateReactionDtoValidator()
    {
        RuleFor(x => x.Emoji).NotEmpty().MaximumLength(10);
    }
}
