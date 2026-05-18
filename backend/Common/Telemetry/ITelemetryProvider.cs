namespace TaskManager.Api.Common.Telemetry;

public interface ITelemetryProvider
{
    void CaptureEvent(string eventName, string? userId = null, Dictionary<string, object>? properties = null);
    void IdentifyUser(string userId, Dictionary<string, object>? traits = null);
    void CapturePageView(string page, string? userId = null);
    void CaptureException(Exception exception, string? userId = null, Dictionary<string, object>? properties = null);
}
