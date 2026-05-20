using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManager.Api.Modules.Issues.Entities;

namespace TaskManager.Api.Data.Configurations;

public class IssueMentionConfiguration : IEntityTypeConfiguration<IssueMention>
{
    public void Configure(EntityTypeBuilder<IssueMention> builder)
    {
        builder.HasKey(m => new { m.IssueId, m.MentionedUserId });

        builder.HasOne(m => m.Issue)
            .WithMany()
            .HasForeignKey(m => m.IssueId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(m => m.MentionedUser)
            .WithMany()
            .HasForeignKey(m => m.MentionedUserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
