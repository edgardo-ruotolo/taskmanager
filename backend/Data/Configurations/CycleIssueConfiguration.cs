using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManager.Api.Modules.Cycles.Entities;

namespace TaskManager.Api.Data.Configurations;

public class CycleIssueConfiguration : IEntityTypeConfiguration<CycleIssue>
{
    public void Configure(EntityTypeBuilder<CycleIssue> builder)
    {
        builder.HasIndex(ci => new { ci.CycleId, ci.IssueId }).IsUnique();

        builder.HasOne(ci => ci.Cycle)
            .WithMany(c => c.CycleIssues)
            .HasForeignKey(ci => ci.CycleId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(ci => ci.Issue)
            .WithMany()
            .HasForeignKey(ci => ci.IssueId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
