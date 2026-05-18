using FluentValidation;
using FluentValidation.AspNetCore;
using Hangfire;
using Hangfire.PostgreSql;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;
using Serilog;
using TaskManager.Api.Common.Auth;
using TaskManager.Api.Common.Authorization;
using TaskManager.Api.Common.Email;
using TaskManager.Api.Common.Filters;
using TaskManager.Api.Data;
using TaskManager.Api.Data.Seeders;
using TaskManager.Api.Hubs;
using TaskManager.Api.Modules.Auth.Entities;
using TaskManager.Api.Modules.Admin.Services;
using TaskManager.Api.Modules.Auth.Services;
using TaskManager.Api.Modules.Companies.Services;
using TaskManager.Api.Modules.Cycles.Services;
using TaskManager.Api.Modules.Estimates.Services;
using TaskManager.Api.Modules.Files.Services;
using TaskManager.Api.Modules.Issues.Services;
using TaskManager.Api.Modules.Labels.Services;
using TaskManager.Api.Modules.Notifications.Services;
using TaskManager.Api.Modules.ProjectModules.Services;
using TaskManager.Api.Modules.States.Services;
using TaskManager.Api.Modules.Favorites.Services;
using TaskManager.Api.Modules.Intake.Services;
using TaskManager.Api.Modules.Recurring.Services;
using TaskManager.Api.Modules.Webhooks.Services;
using TaskManager.Api.Modules.Drafts.Services;
using TaskManager.Api.Modules.Exporter.Jobs;
using TaskManager.Api.Modules.Workspaces.Services;
using TaskManager.Api.Common.Ai;

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

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Postgres")));

builder.Services.AddIdentity<User, IdentityRole<Guid>>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequiredLength = 8;
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUser, CurrentUser>();

builder.Services.AddSignalR();

builder.Services.AddAutoMapper(typeof(Program).Assembly);

builder.Services.AddValidatorsFromAssembly(typeof(Program).Assembly);
builder.Services.AddFluentValidationAutoValidation();

builder.Services.AddScoped<RequireWorkspaceMemberAttribute>();
builder.Services.AddScoped<RequireWorkspaceAdminAttribute>();
builder.Services.AddScoped<RequireCompanyMemberAttribute>();
builder.Services.AddScoped<RequireCompanyAdminAttribute>();

builder.Services.AddScoped<IEmailService, LogOnlyEmailService>();
// To use Brevo for real email delivery, comment the line above and uncomment:
// builder.Services.AddHttpClient<IEmailService, BrevoEmailService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IWorkspaceService, WorkspaceService>();
builder.Services.AddScoped<IWorkspaceActivityService, WorkspaceActivityService>();
builder.Services.AddScoped<ICompanyService, CompanyService>();
builder.Services.AddScoped<IStateService, StateService>();
builder.Services.AddScoped<IStateGroupService, StateGroupService>();
builder.Services.AddScoped<IIssueService, IssueService>();
builder.Services.AddScoped<IIssueCommentService, IssueCommentService>();
builder.Services.AddScoped<IIssueReactionService, IssueReactionService>();
builder.Services.AddScoped<IIssueActivityService, IssueActivityService>();
builder.Services.AddScoped<IIssueSubscriberService, IssueSubscriberService>();
builder.Services.AddScoped<IIssueRelationService, IssueRelationService>();
builder.Services.AddScoped<IIssueLinkService, IssueLinkService>();
builder.Services.AddScoped<IIssueVersionService, IssueVersionService>();
builder.Services.AddScoped<ICycleService, CycleService>();
builder.Services.AddScoped<IProjectModuleService, ProjectModuleService>();
builder.Services.AddScoped<ILabelService, LabelService>();
builder.Services.AddScoped<IIssueViewService, IssueViewService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IUserNotificationPreferenceService, UserNotificationPreferenceService>();
builder.Services.AddScoped<IWebhookService, WebhookService>();
builder.Services.AddScoped<IFileStorageService, LocalFileStorage>();
builder.Services.AddScoped<IFileAssetService, FileAssetService>();
builder.Services.AddScoped<IIssueTypeService, IssueTypeService>();
builder.Services.AddScoped<IApiTokenService, ApiTokenService>();
builder.Services.AddScoped<IOAuthAccountService, OAuthAccountService>();
builder.Services.AddScoped<IEstimateService, EstimateService>();
builder.Services.AddScoped<IInstanceConfigService, InstanceConfigService>();
builder.Services.AddScoped<IFavoriteService, FavoriteService>();
builder.Services.AddScoped<IIntakeService, IntakeService>();
builder.Services.AddScoped<IRecurringService, RecurringService>();
builder.Services.AddScoped<IRecurringExecutor, RecurringExecutor>();
builder.Services.AddScoped<IRecurringDispatcher, RecurringDispatcher>();
builder.Services.AddScoped<IDraftService, DraftService>();
builder.Services.AddScoped<ExportJob>();
builder.Services.AddScoped<IAiProvider, StubAiProvider>();

var pgConnectionString = builder.Configuration.GetConnectionString("Postgres")!;
builder.Services.AddHangfire(cfg => cfg
    .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
    .UseSimpleAssemblyNameTypeSerializer()
    .UseRecommendedSerializerSettings()
    .UsePostgreSqlStorage(o => o.UseNpgsqlConnection(pgConnectionString)));
builder.Services.AddHangfireServer();

if (builder.Environment.IsDevelopment())
    builder.Services.AddCors(o => o.AddDefaultPolicy(p =>
        p.WithOrigins("http://localhost:5173")
         .AllowAnyMethod()
         .AllowAnyHeader()
         .AllowCredentials()));

builder.Services.AddControllers(o => o.Filters.Add<GlobalExceptionFilter>());
builder.Services.AddOpenApi();

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
    app.UseCors();
}

app.UseStaticFiles();
app.UseSerilogRequestLogging();
app.UseMiddleware<ApiTokenAuthenticationMiddleware>();
app.UseAuthentication();
app.UseAuthorization();
app.UseHangfireDashboard("/hangfire");
RecurringJob.AddOrUpdate<IRecurringDispatcher>(
    "recurring-dispatcher",
    d => d.DispatchDueTemplatesAsync(CancellationToken.None),
    "*/15 * * * *");
app.MapControllers();
app.MapHub<NotificationHub>("/hubs/notifications");
app.MapHub<IssueHub>("/hubs/issues");
app.MapHub<DocumentHub>("/hubs/document");

app.Run();
