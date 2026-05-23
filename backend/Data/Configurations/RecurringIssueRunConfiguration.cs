using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManager.Api.Modules.Recurring.Entities;

namespace TaskManager.Api.Data.Configurations;

public class RecurringIssueRunConfiguration : IEntityTypeConfiguration<RecurringIssueRun>
{
    public void Configure(EntityTypeBuilder<RecurringIssueRun> builder)
    {
        builder.Property(r => r.Status).HasConversion<string>();
        builder.Property(r => r.ErrorMessage).HasDefaultValue(string.Empty);

        builder.HasOne(r => r.Workspace)
            .WithMany()
            .HasForeignKey(r => r.WorkspaceId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(r => r.Template)
            .WithMany(t => t.Runs)
            .HasForeignKey(r => r.TemplateId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(r => r.BlockedByIssues)
            .WithMany()
            .UsingEntity(j => j.ToTable("recurring_issue_run_blocked_issues"));
    }
}

public class RecurringIssueRunIssueConfiguration : IEntityTypeConfiguration<RecurringIssueRunIssue>
{
    public void Configure(EntityTypeBuilder<RecurringIssueRunIssue> builder)
    {
        builder.HasKey(x => new { x.RunId, x.IssueId });

        builder.HasOne(x => x.Run)
            .WithMany(r => r.GeneratedIssues)
            .HasForeignKey(x => x.RunId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Issue)
            .WithMany()
            .HasForeignKey(x => x.IssueId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Project)
            .WithMany()
            .HasForeignKey(x => x.ProjectId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
