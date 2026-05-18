using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManager.Api.Modules.Companies.Entities;
using TaskManager.Api.Modules.States.Entities;

namespace TaskManager.Api.Data.Configurations;

public class CompanyConfiguration : IEntityTypeConfiguration<Company>
{
    public void Configure(EntityTypeBuilder<Company> builder)
    {
        builder.Property(c => c.Name).IsRequired().HasMaxLength(255);
        builder.Property(c => c.Identifier).IsRequired().HasMaxLength(10);
        builder.HasIndex(c => new { c.WorkspaceId, c.Identifier }).IsUnique();
        builder.Property(c => c.Description).HasMaxLength(1000);
        builder.Property(c => c.LogoUrl).HasMaxLength(500);

        builder.HasOne(c => c.Owner)
            .WithMany()
            .HasForeignKey(c => c.OwnerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.Workspace)
            .WithMany()
            .HasForeignKey(c => c.WorkspaceId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(c => c.StateGroup)
            .WithMany()
            .HasForeignKey(c => c.StateGroupId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
