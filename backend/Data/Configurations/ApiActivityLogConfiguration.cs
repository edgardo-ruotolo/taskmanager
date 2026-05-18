using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManager.Api.Modules.Auth.Entities;

namespace TaskManager.Api.Data.Configurations;

public class ApiActivityLogConfiguration : IEntityTypeConfiguration<ApiActivityLog>
{
    public void Configure(EntityTypeBuilder<ApiActivityLog> builder)
    {
        builder.Property(l => l.Path).IsRequired().HasMaxLength(1024);
        builder.Property(l => l.Method).IsRequired().HasMaxLength(10);
        builder.Property(l => l.IpAddress).HasMaxLength(45);
        builder.Property(l => l.UserAgent).HasMaxLength(512);

        builder.HasOne(l => l.ApiToken)
            .WithMany()
            .HasForeignKey(l => l.ApiTokenId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(l => l.ApiTokenId);
        builder.HasIndex(l => l.CreatedAt);
    }
}
