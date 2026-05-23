using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManager.Api.Modules.Issues.Entities;

namespace TaskManager.Api.Data.Configurations;

public class IssueConfiguration : IEntityTypeConfiguration<Issue>
{
    public void Configure(EntityTypeBuilder<Issue> builder)
    {
        builder.Property(i => i.Title).IsRequired().HasMaxLength(500);
        builder.Property(i => i.Priority).HasConversion<int>();

        builder.HasIndex(i => new { i.ProjectId, i.SequenceId }).IsUnique();

        // Performance indexes — support the global soft-delete + archive filter and
        // the most common access patterns (sort, state, assignee scoped by project).
        builder.HasIndex(i => new { i.ProjectId, i.IsDeleted, i.IsArchived })
            .HasDatabaseName("IX_Issues_ProjectId_IsDeleted_IsArchived");

        builder.HasIndex(i => new { i.ProjectId, i.SortOrder, i.CreatedAt })
            .HasDatabaseName("IX_Issues_ProjectId_SortOrder_CreatedAt");

        builder.HasIndex(i => new { i.ProjectId, i.StateId })
            .HasDatabaseName("IX_Issues_ProjectId_StateId");

        builder.HasIndex(i => new { i.ProjectId, i.AssigneeId })
            .HasDatabaseName("IX_Issues_ProjectId_AssigneeId");

        builder.HasOne(i => i.Project)
            .WithMany()
            .HasForeignKey(i => i.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(i => i.State)
            .WithMany()
            .HasForeignKey(i => i.StateId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(i => i.CreatedBy)
            .WithMany()
            .HasForeignKey(i => i.CreatedById)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(i => i.Assignee)
            .WithMany()
            .HasForeignKey(i => i.AssigneeId)
            .OnDelete(DeleteBehavior.SetNull)
            .IsRequired(false);

        builder.HasOne(i => i.Parent)
            .WithMany(i => i.SubIssues)
            .HasForeignKey(i => i.ParentId)
            .OnDelete(DeleteBehavior.SetNull)
            .IsRequired(false);

        builder.HasOne(i => i.IssueType)
            .WithMany()
            .HasForeignKey(i => i.IssueTypeId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(i => i.UpdatedBy)
            .WithMany()
            .HasForeignKey(i => i.UpdatedById)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(i => i.EstimatePoint)
            .WithMany()
            .HasForeignKey(i => i.EstimatePointId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Property(i => i.SortOrder).HasDefaultValue(65535d);
        builder.Property(i => i.IsDraft).HasDefaultValue(false);

        builder.Property(e => e.ApprovalRequiredStateIds)
            .HasColumnType("uuid[]");

        builder.HasOne(e => e.ApprovedBy)
            .WithMany()
            .HasForeignKey(e => e.ApprovedById)
            .OnDelete(DeleteBehavior.SetNull)
            .IsRequired(false);
    }
}
