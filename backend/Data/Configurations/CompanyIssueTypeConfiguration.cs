using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManager.Api.Modules.Issues.Entities;

namespace TaskManager.Api.Data.Configurations;

public class CompanyIssueTypeConfiguration : IEntityTypeConfiguration<CompanyIssueType>
{
    public void Configure(EntityTypeBuilder<CompanyIssueType> builder)
    {
        builder.HasKey(cit => new { cit.CompanyId, cit.IssueTypeId });

        builder.HasOne(cit => cit.Company)
            .WithMany()
            .HasForeignKey(cit => cit.CompanyId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(cit => cit.IssueType)
            .WithMany()
            .HasForeignKey(cit => cit.IssueTypeId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
