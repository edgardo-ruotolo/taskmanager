namespace TaskManager.Api.Common.Telemetry;

public class NoOpTelemetryProvider : ITelemetryProvider
{
    // All methods are no-op — silently discard events
    public void CaptureEvent(string eventName, string? userId = null, Dictionary<string, object>? properties = null) { }
    public void IdentifyUser(string userId, Dictionary<string, object>? traits = null) { }
    public void CapturePageView(string page, string? userId = null) { }
    public void CaptureException(Exception exception, string? userId = null, Dictionary<string, object>? properties = null) { }
}
