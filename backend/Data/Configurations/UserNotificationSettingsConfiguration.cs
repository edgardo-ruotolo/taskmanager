using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManager.Api.Modules.Notifications.Entities;

namespace TaskManager.Api.Data.Configurations;

public class UserNotificationSettingsConfiguration : IEntityTypeConfiguration<UserNotificationSettings>
{
    public void Configure(EntityTypeBuilder<UserNotificationSettings> builder)
    {
        builder.ToTable("UserNotificationSettings");

        builder.HasKey(x => x.Id);

        builder.HasIndex(x => x.UserId).IsUnique();
        builder.HasIndex(x => x.UnsubscribeToken).IsUnique();

        builder.Property(x => x.UnsubscribeToken).IsRequired().HasMaxLength(64);

        builder.HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
