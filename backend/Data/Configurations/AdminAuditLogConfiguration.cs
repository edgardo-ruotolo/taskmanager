using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManager.Api.Modules.Admin.Entities;

namespace TaskManager.Api.Data.Configurations;

public class AdminAuditLogConfiguration : IEntityTypeConfiguration<AdminAuditLog>
{
    public void Configure(EntityTypeBuilder<AdminAuditLog> builder)
    {
        builder.ToTable("admin_audit_logs");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Action).IsRequired().HasMaxLength(120);
        builder.Property(x => x.ActorEmail).HasMaxLength(255);
        builder.Property(x => x.TargetType).HasMaxLength(120);
        builder.Property(x => x.TargetId).HasMaxLength(120);
        builder.Property(x => x.Payload).HasColumnType("jsonb");
        builder.Property(x => x.IpAddress).HasMaxLength(64);
        builder.Property(x => x.UserAgent).HasMaxLength(500);
        builder.HasIndex(x => x.Timestamp);
        builder.HasIndex(x => x.ActorId);
        builder.HasIndex(x => x.TargetType);
    }
}
