using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManager.Api.Modules.Issues.Entities;

namespace TaskManager.Api.Data.Configurations;

public class IssueLinkConfiguration : IEntityTypeConfiguration<IssueLink>
{
    public void Configure(EntityTypeBuilder<IssueLink> builder)
    {
        builder.Property(l => l.Url).IsRequired().HasMaxLength(2048);
        builder.Property(l => l.Title).IsRequired().HasMaxLength(255);

        builder.HasOne(l => l.Issue)
            .WithMany()
            .HasForeignKey(l => l.IssueId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
