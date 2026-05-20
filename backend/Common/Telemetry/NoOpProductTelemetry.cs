namespace TaskManager.Api.Common.Telemetry;

public class NoOpProductTelemetry : IProductTelemetry
{
    public Task TrackEventAsync(string eventName, Guid? userId = null, object? properties = null, CancellationToken ct = default)
        => Task.CompletedTask;
}
