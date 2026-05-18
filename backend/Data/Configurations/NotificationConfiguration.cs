using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManager.Api.Modules.Notifications.Entities;

namespace TaskManager.Api.Data.Configurations;

public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.Property(n => n.Title).IsRequired().HasMaxLength(500);
        builder.Property(n => n.Message).IsRequired().HasMaxLength(2000);

        builder.HasIndex(n => new { n.RecipientId, n.IsRead });

        builder.HasOne(n => n.Recipient)
            .WithMany()
            .HasForeignKey(n => n.RecipientId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(n => n.Sender)
            .WithMany()
            .HasForeignKey(n => n.SenderId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
