using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TaskManager.Api.Data;

namespace TaskManager.Tests.Integration;

/// <summary>
/// Integration test fixture that boots the API with an in-memory EF Core
/// provider and minimal env-var stubs so seeders do not blow up.
///
/// Hangfire/PostgreSQL-specific paths require a real database; the tests under
/// `Tests/Integration` that need them are marked with [Trait("requires", "postgres")]
/// and skipped by default in CI without the infrastructure available.
/// </summary>
public class AppFixture : WebApplicationFactory<Program>
{
    private readonly string _dbName = "taskmanager-test-" + Guid.NewGuid().ToString("N");

    public AppFixture()
    {
        // Stub env vars required by AdminUserSeeder fail-fast.
        Environment.SetEnvironmentVariable("ADMIN_USERNAME", "admin");
        Environment.SetEnvironmentVariable("ADMIN_EMAIL", "admin@test.local");
        Environment.SetEnvironmentVariable("ADMIN_PASSWORD", "Test1234!Password");
        Environment.SetEnvironmentVariable("ADMIN_FIRST_NAME", "Test");
        Environment.SetEnvironmentVariable("ADMIN_LAST_NAME", "Admin");
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureServices(services =>
        {
            // Replace the existing DbContext registration with the in-memory provider.
            var dbContextDescriptor = services.SingleOrDefault(d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));
            if (dbContextDescriptor is not null) services.Remove(dbContextDescriptor);

            services.AddDbContext<AppDbContext>(opts => opts.UseInMemoryDatabase(_dbName));
        });
    }
}
