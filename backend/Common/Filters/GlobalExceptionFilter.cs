using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using TaskManager.Api.Common.Exceptions;

namespace TaskManager.Api.Common.Filters;

public class GlobalExceptionFilter : IExceptionFilter
{
    private readonly ILogger<GlobalExceptionFilter> _logger;

    public GlobalExceptionFilter(ILogger<GlobalExceptionFilter> logger) => _logger = logger;

    public void OnException(ExceptionContext context)
    {
        var (statusCode, message) = context.Exception switch
        {
            NotFoundException ex => (StatusCodes.Status404NotFound, ex.Message),
            ForbiddenException ex => (StatusCodes.Status403Forbidden, ex.Message),
            ValidationException ex => (StatusCodes.Status422UnprocessableEntity, ex.Message),
            _ => (StatusCodes.Status500InternalServerError, "An unexpected error occurred.")
        };

        _logger.LogError(context.Exception, "Unhandled exception: {Message}", context.Exception.Message);

        context.Result = new ObjectResult(new { error = message }) { StatusCode = statusCode };
        context.ExceptionHandled = true;
    }
}
