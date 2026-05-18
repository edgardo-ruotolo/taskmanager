using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManager.Api.Modules.Notifications.Entities;

namespace TaskManager.Api.Data.Configurations;

public class UserNotificationPreferenceConfiguration : IEntityTypeConfiguration<UserNotificationPreference>
{
    public void Configure(EntityTypeBuilder<UserNotificationPreference> builder)
    {
        builder.Property(p => p.NotificationType).IsRequired().HasMaxLength(100);
        builder.Property(p => p.Property).IsRequired().HasMaxLength(100);

        builder.HasIndex(p => new { p.UserId, p.NotificationType, p.Property }).IsUnique();

        builder.HasOne(p => p.User)
            .WithMany()
            .HasForeignKey(p => p.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
