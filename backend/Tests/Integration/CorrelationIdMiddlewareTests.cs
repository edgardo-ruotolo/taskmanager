using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.Hosting;
using TaskManager.Api.Common.Middleware;

namespace TaskManager.Tests.Integration;

/// <summary>
/// Tests <see cref="CorrelationIdMiddleware"/> in isolation with a minimal host
/// so they do not depend on Postgres / Hangfire.
/// </summary>
public class CorrelationIdMiddlewareTests
{
    private static async Task<IHost> BuildHostAsync()
    {
        var host = await new HostBuilder()
            .ConfigureWebHost(web =>
            {
                web.UseTestServer();
                web.Configure(app =>
                {
                    app.UseMiddleware<CorrelationIdMiddleware>();
                    app.Run(async ctx =>
                    {
                        var fromContext = ctx.Items[CorrelationIdMiddleware.HeaderName]?.ToString();
                        await ctx.Response.WriteAsync(fromContext ?? "<none>");
                    });
                });
            })
            .StartAsync();
        return host;
    }

    [Fact]
    public async Task GeneratesCorrelationId_WhenHeaderMissing()
    {
        using var host = await BuildHostAsync();
        var server = host.GetTestServer();
        var response = await server.CreateClient().GetAsync("/");
        Assert.True(response.Headers.Contains(CorrelationIdMiddleware.HeaderName));
        var headerValue = response.Headers.GetValues(CorrelationIdMiddleware.HeaderName).Single();
        Assert.False(string.IsNullOrWhiteSpace(headerValue));
    }

    [Fact]
    public async Task EchoesCorrelationId_WhenHeaderProvided()
    {
        using var host = await BuildHostAsync();
        var server = host.GetTestServer();
        var client = server.CreateClient();
        client.DefaultRequestHeaders.Add(CorrelationIdMiddleware.HeaderName, "trace-abc-123");
        var response = await client.GetAsync("/");
        var echoed = response.Headers.GetValues(CorrelationIdMiddleware.HeaderName).Single();
        Assert.Equal("trace-abc-123", echoed);
        var body = await response.Content.ReadAsStringAsync();
        Assert.Equal("trace-abc-123", body);
    }
}
