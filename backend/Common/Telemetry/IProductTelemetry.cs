namespace TaskManager.Api.Common.Telemetry;

/// <summary>
/// Product-analytics tracker. Distinct from <see cref="ITelemetryProvider"/>
/// (general purpose) — this surface is opinionated for activation/retention
/// metrics shown to product managers (signup, workspace_created, etc.).
/// </summary>
public interface IProductTelemetry
{
    Task TrackEventAsync(string eventName, Guid? userId = null, object? properties = null, CancellationToken ct = default);
}
