using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManager.Api.Modules.Modules.Entities;

namespace TaskManager.Api.Data.Configurations;

public class ModuleLinkConfiguration : IEntityTypeConfiguration<ModuleLink>
{
    public void Configure(EntityTypeBuilder<ModuleLink> builder)
    {
        builder.Property(l => l.Title).IsRequired().HasMaxLength(255);
        builder.Property(l => l.Url).IsRequired().HasMaxLength(2000);

        builder.HasOne(l => l.Module)
            .WithMany(m => m.Links)
            .HasForeignKey(l => l.ModuleId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
