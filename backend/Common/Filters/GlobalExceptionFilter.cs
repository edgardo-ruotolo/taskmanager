using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using TaskManager.Api.Common.Exceptions;

namespace TaskManager.Api.Common.Filters;

public class GlobalExceptionFilter : IExceptionFilter
{
    private readonly ILogger<GlobalExceptionFilter> _logger;
    private readonly IWebHostEnvironment _env;

    public GlobalExceptionFilter(ILogger<GlobalExceptionFilter> logger, IWebHostEnvironment env)
    {
        _logger = logger;
        _env = env;
    }

    public void OnException(ExceptionContext context)
    {
        object body;
        int statusCode;

        switch (context.Exception)
        {
            case NotFoundException ex:
                statusCode = StatusCodes.Status404NotFound;
                body = new { error = ex.Message };
                break;

            case ForbiddenException ex:
                statusCode = StatusCodes.Status403Forbidden;
                body = new { error = ex.Message };
                break;

            case ValidationException ex:
                statusCode = StatusCodes.Status422UnprocessableEntity;
                body = ex.Errors is not null
                    ? new { error = "Validation failed.", errors = ex.Errors }
                    : (object)new { error = ex.Message };
                break;

            default:
                statusCode = StatusCodes.Status500InternalServerError;
                body = new { error = "An unexpected error occurred." };
                break;
        }

        if (_env.IsDevelopment())
        {
            _logger.LogError(context.Exception, "Unhandled exception: {Message}", context.Exception.Message);
        }
        else
        {
            // Avoid leaking stack traces and internal structure in production logs
            _logger.LogError("Unhandled exception {ExceptionType}: {Message}",
                context.Exception.GetType().Name, context.Exception.Message);
        }

        context.Result = new ObjectResult(body) { StatusCode = statusCode };
        context.ExceptionHandled = true;
    }
}
