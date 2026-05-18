using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManager.Api.Modules.States.Entities;

namespace TaskManager.Api.Data.Configurations;

public class StateConfiguration : IEntityTypeConfiguration<State>
{
    public void Configure(EntityTypeBuilder<State> builder)
    {
        builder.Property(s => s.Name).IsRequired().HasMaxLength(100);
        builder.Property(s => s.Color).IsRequired().HasMaxLength(7);
        builder.Property(s => s.Category).HasConversion<string>();

        builder.HasOne(s => s.StateGroup)
            .WithMany(g => g.States)
            .HasForeignKey(s => s.StateGroupId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
