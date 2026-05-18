using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManager.Api.Modules.Workspaces.Entities;

namespace TaskManager.Api.Data.Configurations;

public class WorkspaceConfiguration : IEntityTypeConfiguration<Workspace>
{
    public void Configure(EntityTypeBuilder<Workspace> builder)
    {
        builder.Property(w => w.Name).IsRequired().HasMaxLength(255);
        builder.Property(w => w.Slug).IsRequired().HasMaxLength(100);
        builder.HasIndex(w => w.Slug).IsUnique();
        builder.Property(w => w.Description).HasMaxLength(1000);
        builder.Property(w => w.LogoUrl).HasMaxLength(500);

        builder.HasOne(w => w.Owner)
            .WithMany()
            .HasForeignKey(w => w.OwnerId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
