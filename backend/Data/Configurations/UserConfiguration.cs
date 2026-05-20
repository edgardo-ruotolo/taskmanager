using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManager.Api.Modules.Auth.Entities;

namespace TaskManager.Api.Data.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.Property(u => u.FirstName).HasMaxLength(100);
        builder.Property(u => u.LastName).HasMaxLength(100);
        builder.Property(u => u.DisplayName).HasMaxLength(200);
        builder.Property(u => u.AvatarUrl).HasMaxLength(500);

        builder.Property(u => u.OnboardingCompletedSteps)
            .HasColumnType("jsonb")
            .HasDefaultValueSql("'[]'::jsonb");
    }
}
