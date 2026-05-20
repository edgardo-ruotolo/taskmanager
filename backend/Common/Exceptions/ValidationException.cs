namespace TaskManager.Api.Common.Exceptions;

public class ValidationException : Exception
{
    /// <summary>
    /// Per-field validation errors. Keys are camelCase property names matching the client DTO,
    /// values are the localized messages. Null when the failure is not bound to a specific field.
    /// </summary>
    public IReadOnlyDictionary<string, string[]>? Errors { get; }

    public ValidationException(string message) : base(message) { }

    public ValidationException(string message, IReadOnlyDictionary<string, string[]> errors)
        : base(message)
    {
        Errors = errors;
    }
}
