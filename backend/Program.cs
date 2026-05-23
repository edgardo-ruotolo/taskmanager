using System.Threading.RateLimiting;
using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using FluentValidation;
using FluentValidation.AspNetCore;
using Ganss.Xss;
using Hangfire;
using Hangfire.Dashboard;
using Hangfire.PostgreSql;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Scalar.AspNetCore;
using Serilog;
using TaskManager.Api.Common.Auth;
using TaskManager.Api.Common.Authorization;
using TaskManager.Api.Common.Email;
using TaskManager.Api.Common.Filters;
using TaskManager.Api.Common.Multitenancy;
using TaskManager.Api.Common.Security;
using TaskManager.Api.Data;
using TaskManager.Api.Data.Seeders;
using TaskManager.Api.Hubs;
using TaskManager.Api.Modules.Auth.Entities;
using TaskManager.Api.Modules.Admin.Services;
using TaskManager.Api.Modules.Analytics.Services;
using TaskManager.Api.Modules.Search.Services;
using TaskManager.Api.Modules.Teams.Services;
using TaskManager.Api.Modules.Auth.Onboarding.Services;
using TaskManager.Api.Modules.Auth.Services;
using TaskManager.Api.Modules.Projects.Services;
using TaskManager.Api.Modules.Cycles.Services;
using TaskManager.Api.Modules.Estimates.Services;
using TaskManager.Api.Modules.Files.Services;
using TaskManager.Api.Modules.Issues.Services;
using TaskManager.Api.Modules.Labels.Services;
using TaskManager.Api.Modules.Notifications.Services;
using TaskManager.Api.Modules.Modules.Services;
using TaskManager.Api.Modules.States.Services;
using TaskManager.Api.Modules.Intake.Services;
using TaskManager.Api.Modules.Recurring.Services;
using TaskManager.Api.Modules.Drafts.Services;
using TaskManager.Api.Modules.Exporter.Jobs;
using TaskManager.Api.Modules.Workspaces.Services;
using TaskManager.Api.Common.Ai;
using TaskManager.Api.Common.Caching;
using TaskManager.Api.Common.Middleware;
using TaskManager.Api.Common.Telemetry;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.FeatureManagement;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using OpenTelemetry.Metrics;
using StackExchange.Redis;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((ctx, lc) => lc
    .ReadFrom.Configuration(ctx.Configuration)
    .WriteTo.Console());

builder.Configuration
    .AddJsonFile("appsettings.json", optional: false)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true)
    .AddJsonFile("appsettings.Local.json", optional: true)
    .AddEnvironmentVariables();

var npgsqlDataSource = new NpgsqlDataSourceBuilder(builder.Configuration.GetConnectionString("Postgres"))
    .EnableDynamicJson()
    .Build();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(npgsqlDataSource));

builder.Services.AddIdentity<User, IdentityRole<Guid>>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = true;
    options.Password.RequiredLength = 12;
    options.Password.RequiredUniqueChars = 4;
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();

builder.Services.ConfigureApplicationCookie(options =>
{
    options.Cookie.HttpOnly = true;
    options.Cookie.SecurePolicy = builder.Environment.IsDevelopment()
        ? CookieSecurePolicy.SameAsRequest
        : CookieSecurePolicy.Always;
    options.Cookie.SameSite = SameSiteMode.Strict;
    options.ExpireTimeSpan = TimeSpan.FromHours(24);
    options.SlidingExpiration = true;
    options.Events.OnRedirectToLogin = ctx =>
    {
        ctx.Response.StatusCode = StatusCodes.Status401Unauthorized;
        return Task.CompletedTask;
    };
    options.Events.OnRedirectToAccessDenied = ctx =>
    {
        ctx.Response.StatusCode = StatusCodes.Status403Forbidden;
        return Task.CompletedTask;
    };
});

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUser, CurrentUser>();
builder.Services.AddScoped<ICurrentProjectContext, CurrentProjectContext>();

builder.Services.AddSignalR();

builder.Services.AddAutoMapper(typeof(Program).Assembly);

builder.Services.AddValidatorsFromAssembly(typeof(Program).Assembly);
builder.Services.AddFluentValidationAutoValidation();

builder.Services.AddScoped<RequireWorkspaceMemberAttribute>();
builder.Services.AddScoped<RequireWorkspaceAdminAttribute>();
builder.Services.AddScoped<RequireProjectMemberAttribute>();
builder.Services.AddScoped<RequireProjectAdminAttribute>();
builder.Services.AddScoped<IDocumentAccessChecker, DocumentAccessChecker>();

// HTML sanitizer (singleton — instances are thread-safe and configured once)
builder.Services.AddSingleton<IHtmlSanitizer>(_ =>
{
    var sanitizer = new HtmlSanitizer();
    sanitizer.AllowedSchemes.Add("mailto");
    return sanitizer;
});

builder.Services.AddScoped<IEmailService, LogOnlyEmailService>();
// To use Brevo for real email delivery, comment the line above and uncomment:
// builder.Services.AddHttpClient<IEmailService, BrevoEmailService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IRefreshTokenService, RefreshTokenService>();
builder.Services.AddScoped<IOnboardingService, OnboardingService>();
builder.Services.AddScoped<IAnalyticsService, AnalyticsService>();
builder.Services.AddScoped<ITeamService, TeamService>();
builder.Services.AddScoped<ISearchService, SearchService>();
builder.Services.AddScoped<IWorkspaceService, WorkspaceService>();
builder.Services.AddScoped<IWorkspaceActivityService, WorkspaceActivityService>();
builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddScoped<IStateService, StateService>();
builder.Services.AddScoped<IStateGroupService, StateGroupService>();
builder.Services.AddScoped<IIssueService, IssueService>();
builder.Services.AddScoped<IIssueArchiveService, IssueArchiveService>();
builder.Services.AddScoped<IIssueCommentService, IssueCommentService>();
builder.Services.AddScoped<IIssueReactionService, IssueReactionService>();
builder.Services.AddScoped<IIssueActivityService, IssueActivityService>();
builder.Services.AddScoped<IIssueSubscriberService, IssueSubscriberService>();
builder.Services.AddScoped<IIssueRelationService, IssueRelationService>();
builder.Services.AddScoped<IIssueLinkService, IssueLinkService>();
builder.Services.AddScoped<IIssueVersionService, IssueVersionService>();
builder.Services.AddScoped<ICycleService, CycleService>();
builder.Services.AddScoped<IModuleService, ModuleService>();
builder.Services.AddScoped<ILabelService, LabelService>();
builder.Services.AddScoped<IIssueViewService, IssueViewService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IUserNotificationPreferenceService, UserNotificationPreferenceService>();
builder.Services.AddScoped<IFileStorageService, LocalFileStorage>();
builder.Services.AddScoped<IFileAssetService, FileAssetService>();
builder.Services.AddScoped<IIssueTypeService, IssueTypeService>();
builder.Services.AddScoped<IOAuthAccountService, OAuthAccountService>();
builder.Services.AddScoped<IEstimateService, EstimateService>();
builder.Services.AddScoped<IInstanceConfigService, InstanceConfigService>();
builder.Services.AddScoped<IIntakeService, IntakeService>();
builder.Services.AddScoped<IRecurringService, RecurringService>();
builder.Services.AddScoped<IRecurringExecutor, RecurringExecutor>();
builder.Services.AddScoped<IRecurringDispatcher, RecurringDispatcher>();
builder.Services.AddScoped<IDraftService, DraftService>();
builder.Services.AddScoped<TaskManager.Api.Modules.Templates.Services.IIssueTemplateService, TaskManager.Api.Modules.Templates.Services.IssueTemplateService>();
builder.Services.AddScoped<TaskManager.Api.Modules.Issues.Services.IIssueMentionService, TaskManager.Api.Modules.Issues.Services.IssueMentionService>();
builder.Services.AddScoped<ExportJob>();
builder.Services.AddScoped<IAiProvider, StubAiProvider>();
builder.Services.AddSingleton<ITelemetryProvider, NoOpTelemetryProvider>();
// To use PostHog or another provider, replace NoOpTelemetryProvider with a real implementation above.

// Product telemetry (signups, workspace_created, issue_created, issue_completed).
// Resolved from POSTHOG_API_KEY env / PostHog:ApiKey config — when missing we
// register a no-op so call sites remain free of conditionals.
var postHogKey = builder.Configuration["PostHog:ApiKey"];
if (!string.IsNullOrEmpty(postHogKey))
    builder.Services.AddHttpClient<IProductTelemetry, PostHogProductTelemetry>();
else
    builder.Services.AddSingleton<IProductTelemetry, NoOpProductTelemetry>();

// Admin services
builder.Services.AddScoped<TaskManager.Api.Modules.Admin.Services.IAdminAuditService, TaskManager.Api.Modules.Admin.Services.AdminAuditService>();
builder.Services.AddScoped<TaskManager.Api.Modules.Admin.Services.IFeatureFlagService, TaskManager.Api.Modules.Admin.Services.FeatureFlagService>();
builder.Services.AddScoped<TaskManager.Api.Modules.Admin.Services.IGdprService, TaskManager.Api.Modules.Admin.Services.GdprService>();
builder.Services.AddScoped<TaskManager.Api.Common.Filters.AdminAuditFilter>();

// Feature management — backed by appsettings (FeatureManagement section) and
// overridable by the FeatureFlags DB table via the FeatureFlagsController.
builder.Services.AddFeatureManagement();

// Distributed cache + RoomStateStore for DocumentHub. Falls back to in-memory
// when Redis:ConnectionString is empty so local dev keeps working.
var redisConnection = builder.Configuration["Redis:ConnectionString"];
if (!string.IsNullOrEmpty(redisConnection))
{
    builder.Services.AddSingleton<IConnectionMultiplexer>(_ => ConnectionMultiplexer.Connect(redisConnection));
    builder.Services.AddStackExchangeRedisCache(o => o.Configuration = redisConnection);
    builder.Services.AddSingleton<IRoomStateStore, RedisRoomStateStore>();
}
else
{
    Log.Warning("Redis:ConnectionString is empty — falling back to in-memory distributed cache and room-state store. Not suitable for multi-instance deployments.");
    builder.Services.AddDistributedMemoryCache();
    builder.Services.AddSingleton<IRoomStateStore, InMemoryRoomStateStore>();
}

// OpenTelemetry — only wire the OTLP exporter when an endpoint is configured
// so local dev does not spam a non-existent collector.
var otlpEndpoint = Environment.GetEnvironmentVariable("OTEL_EXPORTER_OTLP_ENDPOINT")
    ?? builder.Configuration["OpenTelemetry:OtlpEndpoint"];
if (!string.IsNullOrEmpty(otlpEndpoint))
{
    builder.Services.AddOpenTelemetry()
        .ConfigureResource(r => r.AddService(serviceName: "taskmanager-api"))
        .WithTracing(t => t
            .AddAspNetCoreInstrumentation()
            .AddEntityFrameworkCoreInstrumentation()
            .AddHttpClientInstrumentation()
            .AddOtlpExporter(o => o.Endpoint = new Uri(otlpEndpoint)))
        .WithMetrics(m => m
            .AddAspNetCoreInstrumentation()
            .AddHttpClientInstrumentation()
            .AddRuntimeInstrumentation()
            .AddOtlpExporter(o => o.Endpoint = new Uri(otlpEndpoint)));
}

var pgConnectionString = builder.Configuration.GetConnectionString("Postgres")!;
builder.Services.AddHangfire(cfg => cfg
    .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
    .UseSimpleAssemblyNameTypeSerializer()
    .UseRecommendedSerializerSettings()
    .UsePostgreSqlStorage(o => o.UseNpgsqlConnection(pgConnectionString)));
builder.Services.AddHangfireServer();

// CORS — configured for both Development and Production via Cors:AllowedOrigins
var corsOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
if (corsOrigins.Length == 0 && !builder.Environment.IsDevelopment())
    throw new InvalidOperationException("Cors:AllowedOrigins must be configured in non-development environments");

var corsAllowedMethods = new[] { "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS" };
var corsAllowedHeaders = new[]
{
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "X-Correlation-Id",
    // SignalR negotiate sends this header; without it CORS preflight fails.
    "x-signalr-user-agent",
    "X-SignalR-User-Agent",
    "X-API-Version",
};

builder.Services.AddCors(o => o.AddDefaultPolicy(p =>
{
    if (corsOrigins.Length > 0)
        p.WithOrigins(corsOrigins)
         .WithMethods(corsAllowedMethods)
         .WithHeaders(corsAllowedHeaders)
         .AllowCredentials();
    else if (builder.Environment.IsDevelopment())
        p.WithOrigins("http://localhost:5173", "http://localhost:5174", "http://localhost:5175")
         .WithMethods(corsAllowedMethods)
         .WithHeaders(corsAllowedHeaders)
         .AllowCredentials();
}));

// Rate limiting — protect authentication endpoints from brute force and email flood
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    options.AddPolicy("auth-login", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 5,
                Window = TimeSpan.FromMinutes(15),
                QueueLimit = 0,
                AutoReplenishment = true
            }));

    options.AddPolicy("auth-password", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 3,
                Window = TimeSpan.FromMinutes(15),
                QueueLimit = 0,
                AutoReplenishment = true
            }));
});

// API versioning — backwards compatible: existing routes still resolve to v1
// (clients can request a specific version via header X-API-Version or ?api-version=).
builder.Services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new ApiVersion(1, 0);
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.ReportApiVersions = true;
    options.ApiVersionReader = ApiVersionReader.Combine(
        new HeaderApiVersionReader("X-API-Version"),
        new QueryStringApiVersionReader("api-version"),
        new UrlSegmentApiVersionReader());
})
.AddMvc()
.AddApiExplorer(options =>
{
    options.GroupNameFormat = "'v'VVV";
    options.SubstituteApiVersionInUrl = true;
});

builder.Services.AddControllers(o =>
{
    o.Filters.Add<GlobalExceptionFilter>();
    o.Filters.Add<TaskManager.Api.Common.Filters.AdminAuditFilter>();
})
    .AddJsonOptions(o => o.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter()))
    .ConfigureApiBehaviorOptions(options =>
    {
        // Surface FluentValidation / ModelState errors as 422 with a field map that maps
        // 1:1 to the client form schemas (camelCase keys).
        options.InvalidModelStateResponseFactory = context =>
        {
            var errors = context.ModelState
                .Where(kvp => kvp.Value!.Errors.Count > 0)
                .ToDictionary(
                    kvp => kvp.Key.Length > 0 ? char.ToLowerInvariant(kvp.Key[0]) + kvp.Key[1..] : kvp.Key,
                    kvp => kvp.Value!.Errors.Select(e => e.ErrorMessage).ToArray());

            return new UnprocessableEntityObjectResult(new
            {
                error = "Validation failed.",
                errors
            });
        };
    });
builder.Services.AddOpenApi();

// HSTS — preload-ready in production. Submit to https://hstspreload.org after
// confirming the header survives a 24h soak.
builder.Services.AddHsts(o =>
{
    o.MaxAge = TimeSpan.FromDays(365);
    o.IncludeSubDomains = true;
    o.Preload = true;
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    await StateSeeder.SeedAsync(services);
    await AdminUserSeeder.SeedAsync(services);
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}
else
{
    app.UseHsts();
    app.UseHttpsRedirection();
}

// Correlation-Id must run very early so every subsequent log line is enriched.
app.UseMiddleware<CorrelationIdMiddleware>();

app.UseSecurityHeaders();
app.UseCors();

app.UseStaticFiles();
app.UseSerilogRequestLogging();
app.UseAuthentication();
app.UseRateLimiter();
app.UseAuthorization();
app.UseHangfireDashboard("/hangfire", new DashboardOptions
{
    Authorization = new[] { new HangfireDashboardAuthorizationFilter() }
});
RecurringJob.AddOrUpdate<IRecurringDispatcher>(
    "recurring-dispatcher",
    d => d.DispatchDueTemplatesAsync(CancellationToken.None),
    "*/15 * * * *");
app.MapControllers();
app.MapHub<NotificationHub>("/hubs/notifications");
app.MapHub<IssueHub>("/hubs/issues");
app.MapHub<DocumentHub>("/hubs/document");

app.Run();

// Expose Program as a public partial class so xUnit + WebApplicationFactory can find it.
public partial class Program { }
