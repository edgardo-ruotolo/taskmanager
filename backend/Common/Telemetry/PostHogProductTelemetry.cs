using System.Text.Json;

namespace TaskManager.Api.Common.Telemetry;

/// <summary>
/// PostHog implementation of <see cref="IProductTelemetry"/>. Posts events
/// directly to the PostHog `/capture/` endpoint using a static API key.
/// Sends are fire-and-forget; failures are logged and swallowed so they cannot
/// disturb the request path.
/// </summary>
public class PostHogProductTelemetry : IProductTelemetry
{
    private readonly HttpClient _http;
    private readonly ILogger<PostHogProductTelemetry> _logger;
    private readonly string _apiKey;
    private readonly string _endpoint;

    public PostHogProductTelemetry(HttpClient http, IConfiguration config, ILogger<PostHogProductTelemetry> logger)
    {
        _http = http;
        _logger = logger;
        _apiKey = config["PostHog:ApiKey"] ?? string.Empty;
        _endpoint = config["PostHog:Endpoint"] ?? "https://app.posthog.com/capture/";
    }

    public async Task TrackEventAsync(string eventName, Guid? userId = null, object? properties = null, CancellationToken ct = default)
    {
        if (string.IsNullOrEmpty(_apiKey)) return;
        try
        {
            var payload = new
            {
                api_key = _apiKey,
                @event = eventName,
                distinct_id = userId?.ToString() ?? "anonymous",
                properties = properties ?? new { },
                timestamp = DateTime.UtcNow.ToString("o")
            };

            using var content = new StringContent(JsonSerializer.Serialize(payload), System.Text.Encoding.UTF8, "application/json");
            using var response = await _http.PostAsync(_endpoint, content, ct);
            if (!response.IsSuccessStatusCode)
                _logger.LogWarning("PostHog capture returned {Status} for event {Event}", response.StatusCode, eventName);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "PostHog capture failed for event {Event}", eventName);
        }
    }
}
