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

        builder.HasIndex(i => new { i.CompanyId, i.SequenceId }).IsUnique();

        builder.HasOne(i => i.Company)
            .WithMany()
            .HasForeignKey(i => i.CompanyId)
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
    }
}
