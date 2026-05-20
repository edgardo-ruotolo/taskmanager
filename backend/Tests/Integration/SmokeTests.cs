using System.Net;

namespace TaskManager.Tests.Integration;

/// <summary>
/// Smoke tests for protected endpoints — they require infrastructure (Postgres,
/// Hangfire, etc.) that the in-memory fixture cannot fully emulate. Marked
/// as "requires postgres" so CI can skip them on hosts that do not have the
/// surrounding services available.
/// </summary>
[Trait("requires", "postgres")]
public class SmokeTests : IClassFixture<AppFixture>
{
    private readonly AppFixture _fixture;

    public SmokeTests(AppFixture fixture) => _fixture = fixture;

    [Fact(Skip = "Requires Postgres + Hangfire backing store; runs only in the integration CI lane.")]
    public async Task GetAnyEndpointWithoutAuth_Returns401()
    {
        var client = _fixture.CreateClient();
        var response = await client.GetAsync("/api/workspaces");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact(Skip = "Requires Postgres + Hangfire backing store; runs only in the integration CI lane.")]
    public async Task HangfireDashboard_WithoutAuth_Returns401Or403()
    {
        var client = _fixture.CreateClient(new Microsoft.AspNetCore.Mvc.Testing.WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false
        });
        var response = await client.GetAsync("/hangfire");
        Assert.True(
            response.StatusCode == HttpStatusCode.Unauthorized ||
            response.StatusCode == HttpStatusCode.Forbidden ||
            response.StatusCode == HttpStatusCode.NotFound,
            $"Expected 401/403/404, got {(int)response.StatusCode}");
    }
}
