using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManager.Api.Modules.Issues.Entities;

namespace TaskManager.Api.Data.Configurations;

public class IssueRelationConfiguration : IEntityTypeConfiguration<IssueRelation>
{
    public void Configure(EntityTypeBuilder<IssueRelation> builder)
    {
        builder.Property(r => r.RelationType).HasConversion<string>();

        builder.HasOne(r => r.Issue)
            .WithMany()
            .HasForeignKey(r => r.IssueId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(r => r.RelatedIssue)
            .WithMany()
            .HasForeignKey(r => r.RelatedIssueId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
