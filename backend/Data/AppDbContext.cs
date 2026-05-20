using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Common.Auditing;
using TaskManager.Api.Common.Multitenancy;
using TaskManager.Api.Modules.Admin.Entities;
using TaskManager.Api.Modules.Auth.Entities;
using TaskManager.Api.Modules.Companies.Entities;
using TaskManager.Api.Modules.Cycles.Entities;
using TaskManager.Api.Modules.Files.Entities;
using TaskManager.Api.Modules.Issues.Entities;
using TaskManager.Api.Modules.Labels.Entities;
using TaskManager.Api.Modules.Estimates.Entities;
using TaskManager.Api.Modules.Intake.Entities;
using TaskManager.Api.Modules.Notifications.Entities;
using TaskManager.Api.Modules.ProjectModules.Entities;
using TaskManager.Api.Modules.Recurring.Entities;
using TaskManager.Api.Modules.Drafts.Entities;
using TaskManager.Api.Modules.States.Entities;
using TaskManager.Api.Modules.Analytics.Entities;
using TaskManager.Api.Modules.Exporter.Entities;
using TaskManager.Api.Modules.Home.Entities;
using TaskManager.Api.Modules.Space.Entities;
using TaskManager.Api.Modules.Teams.Entities;
using TaskManager.Api.Modules.Workspaces.Entities;
using TaskManager.Api.Modules.Importer.Entities;
using TaskManager.Api.Modules.Templates.Entities;
using TaskManager.Api.Modules.TimeTracking.Entities;

namespace TaskManager.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options, ICurrentCompanyContext currentCompany)
    : IdentityDbContext<User, IdentityRole<Guid>, Guid>(options)
{
    private readonly ICurrentCompanyContext _currentCompany = currentCompany;

    public DbSet<Workspace> Workspaces => Set<Workspace>();
    public DbSet<WorkspaceMember> WorkspaceMembers => Set<WorkspaceMember>();
    public DbSet<Company> Companies => Set<Company>();
    public DbSet<CompanyMember> CompanyMembers => Set<CompanyMember>();
    public DbSet<State> States => Set<State>();
    public DbSet<StateGroup> StateGroups => Set<StateGroup>();
    public DbSet<Issue> Issues => Set<Issue>();
    public DbSet<IssueAssignee> IssueAssignees => Set<IssueAssignee>();
    public DbSet<IssueLabel> IssueLabels => Set<IssueLabel>();
    public DbSet<Cycle> Cycles => Set<Cycle>();
    public DbSet<CycleIssue> CycleIssues => Set<CycleIssue>();
    public DbSet<ProjectModule> ProjectModules => Set<ProjectModule>();
    public DbSet<ModuleIssue> ModuleIssues => Set<ModuleIssue>();
    public DbSet<ModuleLink> ModuleLinks => Set<ModuleLink>();
    public DbSet<ModuleMember> ModuleMembers => Set<ModuleMember>();
    public DbSet<Label> Labels => Set<Label>();
    public DbSet<IssueComment> IssueComments => Set<IssueComment>();
    public DbSet<CommentReaction> CommentReactions => Set<CommentReaction>();
    public DbSet<IssueReaction> IssueReactions => Set<IssueReaction>();
    public DbSet<IssueActivity> IssueActivities => Set<IssueActivity>();
    public DbSet<IssueView> IssueViews => Set<IssueView>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<FileAsset> FileAssets => Set<FileAsset>();
    public DbSet<IssueType> IssueTypes => Set<IssueType>();
    public DbSet<OAuthAccount> OAuthAccounts => Set<OAuthAccount>();
    public DbSet<Estimate> Estimates => Set<Estimate>();
    public DbSet<EstimatePoint> EstimatePoints => Set<EstimatePoint>();
    public DbSet<WorkspaceInvitation> WorkspaceInvitations => Set<WorkspaceInvitation>();
    public DbSet<CompanyInvitation> CompanyInvitations => Set<CompanyInvitation>();
    public DbSet<IssueSubscriber> IssueSubscribers => Set<IssueSubscriber>();
    public DbSet<IssueRelation> IssueRelations => Set<IssueRelation>();
    public DbSet<IssueLink> IssueLinks => Set<IssueLink>();
    public DbSet<IssueVersion> IssueVersions => Set<IssueVersion>();
    public DbSet<UserNotificationPreference> UserNotificationPreferences => Set<UserNotificationPreference>();
    public DbSet<WorkspaceActivity> WorkspaceActivities => Set<WorkspaceActivity>();
    public DbSet<CompanyIssueType> CompanyIssueTypes => Set<CompanyIssueType>();
    public DbSet<InstanceConfiguration> InstanceConfigurations => Set<InstanceConfiguration>();
    public DbSet<IntakeIssue> IntakeIssues => Set<IntakeIssue>();
    public DbSet<RecurringIssueTemplate> RecurringIssueTemplates => Set<RecurringIssueTemplate>();
    public DbSet<RecurringIssueTemplateCompany> RecurringIssueTemplateCompanies => Set<RecurringIssueTemplateCompany>();
    public DbSet<RecurringIssueTemplateAssignee> RecurringIssueTemplateAssignees => Set<RecurringIssueTemplateAssignee>();
    public DbSet<RecurringIssueTemplateLabel> RecurringIssueTemplateLabels => Set<RecurringIssueTemplateLabel>();
    public DbSet<RecurringIssueRun> RecurringIssueRuns => Set<RecurringIssueRun>();
    public DbSet<RecurringIssueRunIssue> RecurringIssueRunIssues => Set<RecurringIssueRunIssue>();
    public DbSet<DraftIssue> DraftIssues => Set<DraftIssue>();
    public DbSet<WorkspaceTheme> WorkspaceThemes => Set<WorkspaceTheme>();
    public DbSet<Team> Teams => Set<Team>();
    public DbSet<TeamMember> TeamMembers => Set<TeamMember>();
    public DbSet<AnalyticView> AnalyticViews => Set<AnalyticView>();
    public DbSet<ExporterHistory> ExporterHistories => Set<ExporterHistory>();
    public DbSet<UserRecentVisit> UserRecentVisits => Set<UserRecentVisit>();
    public DbSet<WorkspaceQuickLink> WorkspaceQuickLinks => Set<WorkspaceQuickLink>();
    public DbSet<DeployBoard> DeployBoards => Set<DeployBoard>();
    public DbSet<ImporterHistory> ImporterHistories => Set<ImporterHistory>();
    public DbSet<IssueWorklog> IssueWorklogs => Set<IssueWorklog>();
    public DbSet<MagicLinkToken> MagicLinkTokens => Set<MagicLinkToken>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<IssueMention> IssueMentions => Set<IssueMention>();
    public DbSet<IssueDescriptionVersion> IssueDescriptionVersions => Set<IssueDescriptionVersion>();
    public DbSet<IssueTemplate> IssueTemplates => Set<IssueTemplate>();
    public DbSet<Modules.Admin.Entities.AdminAuditLog> AdminAuditLogs => Set<Modules.Admin.Entities.AdminAuditLog>();
    public DbSet<Modules.Admin.Entities.FeatureFlag> FeatureFlags => Set<Modules.Admin.Entities.FeatureFlag>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

        builder.Entity<User>().HasQueryFilter(e => !e.IsDeleted);
        builder.Entity<Workspace>().HasQueryFilter(e => !e.IsDeleted);
        builder.Entity<WorkspaceMember>().HasQueryFilter(e => !e.IsDeleted);
        builder.Entity<Company>().HasQueryFilter(e => !e.IsDeleted);
        builder.Entity<CompanyMember>().HasQueryFilter(e => !e.IsDeleted);
        builder.Entity<State>().HasQueryFilter(e => !e.IsDeleted);
        builder.Entity<StateGroup>().HasQueryFilter(e => !e.IsDeleted);
        builder.Entity<Issue>().HasQueryFilter(e => !e.IsDeleted && !e.IsArchived
            && (_currentCompany.CompanyId == null || e.CompanyId == _currentCompany.CompanyId));
        builder.Entity<Cycle>().HasQueryFilter(e => !e.IsDeleted && !e.IsArchived
            && (_currentCompany.CompanyId == null || e.CompanyId == _currentCompany.CompanyId));
        builder.Entity<CycleIssue>().HasQueryFilter(e => !e.IsDeleted);
        builder.Entity<ProjectModule>().HasQueryFilter(e => !e.IsDeleted && !e.IsArchived
            && (_currentCompany.CompanyId == null || e.CompanyId == _currentCompany.CompanyId));
        builder.Entity<ModuleIssue>().HasQueryFilter(e => !e.IsDeleted);
        builder.Entity<ModuleLink>().HasQueryFilter(e => !e.IsDeleted);
        builder.Entity<ModuleMember>().HasQueryFilter(e => !e.IsDeleted);
        builder.Entity<Label>().HasQueryFilter(e => !e.IsDeleted);
        builder.Entity<IssueComment>().HasQueryFilter(e => !e.IsDeleted);
        builder.Entity<CommentReaction>().HasQueryFilter(e => !e.IsDeleted);
        builder.Entity<IssueReaction>().HasQueryFilter(e => !e.IsDeleted);
        builder.Entity<IssueActivity>().HasQueryFilter(e => !e.IsDeleted);
        builder.Entity<IssueView>().HasQueryFilter(e => !e.IsDeleted);
        builder.Entity<Notification>().HasQueryFilter(e => !e.IsDeleted);
        builder.Entity<FileAsset>().HasQueryFilter(e => !e.IsDeleted);
        builder.Entity<IssueType>().HasQueryFilter(e => !e.IsDeleted);
        builder.Entity<OAuthAccount>().HasQueryFilter(e => !e.IsDeleted);
        builder.Entity<Estimate>().HasQueryFilter(e => !e.IsDeleted
            && (_currentCompany.CompanyId == null || e.CompanyId == _currentCompany.CompanyId));
        builder.Entity<IssueLink>().HasQueryFilter(e => !e.IsDeleted);
        builder.Entity<WorkspaceInvitation>().HasQueryFilter(e => !e.IsDeleted);
        builder.Entity<CompanyInvitation>().HasQueryFilter(e => !e.IsDeleted);
        builder.Entity<WorkspaceActivity>().HasQueryFilter(e => !e.IsDeleted);
        builder.Entity<IntakeIssue>(e =>
        {
            e.HasQueryFilter(x => !x.IsDeleted
                && (_currentCompany.CompanyId == null || x.CompanyId == _currentCompany.CompanyId));
            e.Property(x => x.Status).HasConversion<int>();
            e.HasOne(x => x.Company).WithMany().HasForeignKey(x => x.CompanyId).OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<DraftIssue>().HasQueryFilter(e => !e.IsDeleted
            && (_currentCompany.CompanyId == null || e.CompanyId == _currentCompany.CompanyId));

        builder.Entity<WorkspaceTheme>().HasQueryFilter(e => !e.IsDeleted);
        builder.Entity<Team>().HasQueryFilter(e => !e.IsDeleted);
        builder.Entity<TeamMember>().HasQueryFilter(e => !e.IsDeleted);
        builder.Entity<AnalyticView>().HasQueryFilter(e => !e.IsDeleted);
        builder.Entity<ExporterHistory>().HasQueryFilter(e => !e.IsDeleted);
        builder.Entity<UserRecentVisit>().HasQueryFilter(e => !e.IsDeleted);
        builder.Entity<WorkspaceQuickLink>().HasQueryFilter(e => !e.IsDeleted);
        builder.Entity<DeployBoard>().HasQueryFilter(e => !e.IsDeleted
            && (_currentCompany.CompanyId == null || e.CompanyId == _currentCompany.CompanyId));
        builder.Entity<ImporterHistory>().HasQueryFilter(e => !e.IsDeleted
            && (_currentCompany.CompanyId == null || e.CompanyId == _currentCompany.CompanyId));
        builder.Entity<IssueWorklog>().HasQueryFilter(e => !e.IsDeleted);
        builder.Entity<IssueTemplate>().HasQueryFilter(e => !e.IsDeleted);

        builder.Entity<RecurringIssueTemplate>().HasQueryFilter(e => !e.IsDeleted);
        builder.Entity<RecurringIssueTemplate>()
            .Property(t => t.DaysOfWeek)
            .HasColumnType("jsonb");
        builder.Entity<RecurringIssueRun>().HasQueryFilter(e => !e.IsDeleted);
        builder.Entity<RecurringIssueRunIssue>().HasQueryFilter(e => !e.Run.IsDeleted);
        builder.Entity<RecurringIssueTemplateCompany>().HasQueryFilter(e => !e.Template.IsDeleted);
        builder.Entity<RecurringIssueTemplateAssignee>().HasQueryFilter(e => !e.Template.IsDeleted);
        builder.Entity<RecurringIssueTemplateLabel>().HasQueryFilter(e => !e.Template.IsDeleted);

        builder.Entity<IssueAssignee>().HasKey(x => new { x.IssueId, x.UserId });
        builder.Entity<IssueLabel>().HasKey(x => new { x.IssueId, x.LabelId });

        builder.Entity<IssueAssignee>().HasQueryFilter(e => !e.Issue.IsDeleted);
        builder.Entity<IssueLabel>().HasQueryFilter(e => !e.Issue.IsDeleted);

        // Child entities without IsDeleted — filter through parent navigation
        builder.Entity<EstimatePoint>().HasQueryFilter(e => !e.Estimate.IsDeleted);
        builder.Entity<CompanyIssueType>().HasQueryFilter(e => !e.Company.IsDeleted);
        builder.Entity<IssueRelation>().HasQueryFilter(e => !e.Issue.IsDeleted);
        builder.Entity<IssueSubscriber>().HasQueryFilter(e => !e.Issue.IsDeleted);
        builder.Entity<IssueVersion>().HasQueryFilter(e => !e.Issue.IsDeleted);
        builder.Entity<IssueMention>().HasQueryFilter(e => !e.Issue.IsDeleted);
        builder.Entity<IssueDescriptionVersion>().HasQueryFilter(e => !e.Issue.IsDeleted);
        builder.Entity<UserNotificationPreference>().HasQueryFilter(e => !e.User.IsDeleted);
    }

    public override Task<int> SaveChangesAsync(CancellationToken ct = default)
    {
        foreach (var entry in ChangeTracker.Entries<AuditableEntity>())
            if (entry.State == EntityState.Modified)
                entry.Entity.UpdatedAt = DateTime.UtcNow;
        return base.SaveChangesAsync(ct);
    }
}
