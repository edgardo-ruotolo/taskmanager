using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManager.Api.Modules.Webhooks.Entities;

namespace TaskManager.Api.Data.Configurations;

public class WebhookLogConfiguration : IEntityTypeConfiguration<WebhookLog>
{
    public void Configure(EntityTypeBuilder<WebhookLog> builder)
    {
        builder.Property(l => l.Event).IsRequired().HasMaxLength(100);

        builder.HasOne(l => l.Webhook)
            .WithMany(w => w.Logs)
            .HasForeignKey(l => l.WebhookId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
