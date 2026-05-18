using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManager.Api.Modules.Companies.Entities;

namespace TaskManager.Api.Data.Configurations;

public class CompanyMemberConfiguration : IEntityTypeConfiguration<CompanyMember>
{
    public void Configure(EntityTypeBuilder<CompanyMember> builder)
    {
        builder.HasIndex(m => new { m.CompanyId, m.UserId }).IsUnique();

        builder.HasOne(m => m.Company)
            .WithMany(c => c.Members)
            .HasForeignKey(m => m.CompanyId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(m => m.User)
            .WithMany()
            .HasForeignKey(m => m.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
