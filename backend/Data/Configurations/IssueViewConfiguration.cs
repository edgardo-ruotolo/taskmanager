using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManager.Api.Modules.Issues.Entities;

namespace TaskManager.Api.Data.Configurations;

public class IssueViewConfiguration : IEntityTypeConfiguration<IssueView>
{
    public void Configure(EntityTypeBuilder<IssueView> builder)
    {
        builder.Property(v => v.Name).IsRequired().HasMaxLength(255);
        builder.Property(v => v.Layout).HasMaxLength(50).HasDefaultValue("list");

        builder.HasIndex(v => v.WorkspaceId);
        builder.HasIndex(v => v.OwnerId);

        builder.HasOne(v => v.Workspace)
            .WithMany()
            .HasForeignKey(v => v.WorkspaceId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(v => v.Owner)
            .WithMany()
            .HasForeignKey(v => v.OwnerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(v => v.Company)
            .WithMany()
            .HasForeignKey(v => v.CompanyId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
