using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManager.Api.Modules.Labels.Entities;

namespace TaskManager.Api.Data.Configurations;

public class LabelConfiguration : IEntityTypeConfiguration<Label>
{
    public void Configure(EntityTypeBuilder<Label> builder)
    {
        builder.Property(l => l.Name).IsRequired().HasMaxLength(100);
        builder.Property(l => l.Color).IsRequired().HasMaxLength(7);

        builder.HasIndex(l => new { l.WorkspaceId, l.Name }).IsUnique();

        builder.HasOne(l => l.Workspace)
            .WithMany()
            .HasForeignKey(l => l.WorkspaceId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
