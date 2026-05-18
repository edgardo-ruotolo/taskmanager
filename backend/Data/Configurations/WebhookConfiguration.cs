using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManager.Api.Modules.Webhooks.Entities;

namespace TaskManager.Api.Data.Configurations;

public class WebhookConfiguration : IEntityTypeConfiguration<Webhook>
{
    public void Configure(EntityTypeBuilder<Webhook> builder)
    {
        builder.Property(w => w.Name).IsRequired().HasMaxLength(255);
        builder.Property(w => w.Url).IsRequired().HasMaxLength(2048);

        builder.HasIndex(w => w.WorkspaceId);

        builder.HasOne(w => w.Workspace)
            .WithMany()
            .HasForeignKey(w => w.WorkspaceId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(w => w.CreatedBy)
            .WithMany()
            .HasForeignKey(w => w.CreatedById)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
