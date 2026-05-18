using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManager.Api.Modules.Auth.Entities;

namespace TaskManager.Api.Data.Configurations;

public class OAuthAccountConfiguration : IEntityTypeConfiguration<OAuthAccount>
{
    public void Configure(EntityTypeBuilder<OAuthAccount> builder)
    {
        builder.Property(e => e.Provider).IsRequired().HasMaxLength(50);
        builder.Property(e => e.ProviderUserId).IsRequired().HasMaxLength(255);
        builder.Property(e => e.ProviderEmail).HasMaxLength(256);

        builder.HasIndex(e => new { e.Provider, e.ProviderUserId }).IsUnique();

        builder.HasOne(e => e.User)
            .WithMany()
            .HasForeignKey(e => e.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
