namespace TaskManager.Api.Common.Exceptions;

public class ForbiddenException(string message) : Exception(message);
