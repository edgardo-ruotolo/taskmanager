using Serilog.Context;

namespace TaskManager.Api.Common.Middleware;

/// <summary>
/// Reads (or generates) an X-Correlation-Id for every request, injects it into
/// Serilog's LogContext so structured logs carry it, and echoes it back on the
/// response so the client can correlate failures end-to-end.
/// </summary>
public class CorrelationIdMiddleware
{
    public const string HeaderName = "X-Correlation-Id";
    private readonly RequestDelegate _next;

    public CorrelationIdMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var correlationId = ResolveCorrelationId(context);
        context.Response.Headers[HeaderName] = correlationId;
        context.Items[HeaderName] = correlationId;

        using (LogContext.PushProperty("CorrelationId", correlationId))
        {
            await _next(context);
        }
    }

    private static string ResolveCorrelationId(HttpContext context)
    {
        if (context.Request.Headers.TryGetValue(HeaderName, out var values))
        {
            var incoming = values.ToString();
            if (!string.IsNullOrWhiteSpace(incoming))
                return incoming;
        }
        return Guid.NewGuid().ToString("N");
    }
}
