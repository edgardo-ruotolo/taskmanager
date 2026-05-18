using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManager.Api.Modules.ProjectModules.Entities;

namespace TaskManager.Api.Data.Configurations;

public class ProjectModuleConfiguration : IEntityTypeConfiguration<ProjectModule>
{
    public void Configure(EntityTypeBuilder<ProjectModule> builder)
    {
        builder.Property(m => m.Name).IsRequired().HasMaxLength(255);
        builder.Property(m => m.Status).HasConversion<string>();

        builder.HasOne(m => m.Company)
            .WithMany()
            .HasForeignKey(m => m.CompanyId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(m => m.Owner)
            .WithMany()
            .HasForeignKey(m => m.OwnerId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
