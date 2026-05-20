using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManager.Api.Modules.Auth.Entities;

namespace TaskManager.Api.Data.Configurations;

public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
{
    public void Configure(EntityTypeBuilder<RefreshToken> b)
    {
        b.HasKey(rt => rt.Id);

        b.Property(rt => rt.TokenHash).IsRequired().HasMaxLength(128);
        b.Property(rt => rt.ReplacedByTokenHash).HasMaxLength(128);
        b.Property(rt => rt.CreatedByIp).HasMaxLength(64);
        b.Property(rt => rt.RevokedByIp).HasMaxLength(64);

        b.HasIndex(rt => rt.TokenHash).IsUnique();
        b.HasIndex(rt => new { rt.UserId, rt.ExpiresAt });

        b.HasOne(rt => rt.User)
            .WithMany()
            .HasForeignKey(rt => rt.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
