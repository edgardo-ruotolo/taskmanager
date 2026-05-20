using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManager.Api.Modules.ProjectModules.Entities;

namespace TaskManager.Api.Data.Configurations;

public class ModuleIssueConfiguration : IEntityTypeConfiguration<ModuleIssue>
{
    public void Configure(EntityTypeBuilder<ModuleIssue> builder)
    {
        builder.HasIndex(mi => new { mi.ModuleId, mi.IssueId }).IsUnique();

        builder.HasOne(mi => mi.Module)
            .WithMany(m => m.ModuleIssues)
            .HasForeignKey(mi => mi.ModuleId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(mi => mi.Issue)
            .WithMany(i => i.ModuleIssues)
            .HasForeignKey(mi => mi.IssueId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
