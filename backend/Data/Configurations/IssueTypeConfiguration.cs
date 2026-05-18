using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManager.Api.Modules.Issues.Entities;

namespace TaskManager.Api.Data.Configurations;

public class IssueTypeConfiguration : IEntityTypeConfiguration<IssueType>
{
    public void Configure(EntityTypeBuilder<IssueType> builder)
    {
        builder.Property(e => e.Name).IsRequired().HasMaxLength(100);
        builder.Property(e => e.Color).IsRequired().HasMaxLength(20);
        builder.Property(e => e.Icon).HasMaxLength(100);

        builder.HasIndex(e => new { e.WorkspaceId, e.IsDefault });

        builder.HasOne(e => e.Workspace)
            .WithMany()
            .HasForeignKey(e => e.WorkspaceId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
