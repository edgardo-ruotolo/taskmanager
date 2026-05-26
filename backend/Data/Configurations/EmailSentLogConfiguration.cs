using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManager.Api.Modules.Notifications.Entities;

namespace TaskManager.Api.Data.Configurations;

public class EmailSentLogConfiguration : IEntityTypeConfiguration<EmailSentLog>
{
    public void Configure(EntityTypeBuilder<EmailSentLog> builder)
    {
        builder.ToTable("EmailSentLog");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Kind).IsRequired().HasMaxLength(64);
        builder.Property(x => x.Bucket).IsRequired().HasMaxLength(32);

        builder.HasIndex(x => new { x.UserId, x.Kind, x.Bucket }).IsUnique();
    }
}
