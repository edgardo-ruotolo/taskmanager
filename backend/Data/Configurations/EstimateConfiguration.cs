using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManager.Api.Modules.Estimates.Entities;

namespace TaskManager.Api.Data.Configurations;

public class EstimateConfiguration : IEntityTypeConfiguration<Estimate>
{
    public void Configure(EntityTypeBuilder<Estimate> builder)
    {
        builder.Property(e => e.Name).IsRequired().HasMaxLength(255);
        builder.Property(e => e.Type).HasConversion<string>();

        builder.HasOne(e => e.Project)
            .WithMany()
            .HasForeignKey(e => e.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(e => e.Points)
            .WithOne(p => p.Estimate)
            .HasForeignKey(p => p.EstimateId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class EstimatePointConfiguration : IEntityTypeConfiguration<EstimatePoint>
{
    public void Configure(EntityTypeBuilder<EstimatePoint> builder)
    {
        builder.Property(p => p.Key).IsRequired().HasMaxLength(50);
        builder.Property(p => p.Value).IsRequired().HasMaxLength(255);
    }
}
