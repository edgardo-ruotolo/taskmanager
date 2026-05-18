using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManager.Api.Modules.Auth.Entities;

namespace TaskManager.Api.Data.Configurations;

public class ApiTokenConfiguration : IEntityTypeConfiguration<ApiToken>
{
    public void Configure(EntityTypeBuilder<ApiToken> builder)
    {
        builder.Property(e => e.Name).IsRequired().HasMaxLength(100);
        builder.Property(e => e.TokenHash).IsRequired().HasMaxLength(256);
        builder.Property(e => e.TokenPrefix).IsRequired().HasMaxLength(16);

        builder.HasIndex(e => e.TokenHash).IsUnique();

        builder.HasOne(e => e.User)
            .WithMany()
            .HasForeignKey(e => e.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
