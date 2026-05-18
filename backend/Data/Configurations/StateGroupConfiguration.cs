using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManager.Api.Modules.States.Entities;

namespace TaskManager.Api.Data.Configurations;

public class StateGroupConfiguration : IEntityTypeConfiguration<StateGroup>
{
    public void Configure(EntityTypeBuilder<StateGroup> builder)
    {
        builder.Property(g => g.Name).IsRequired().HasMaxLength(100);
        builder.Property(g => g.Description).HasMaxLength(500);
    }
}
