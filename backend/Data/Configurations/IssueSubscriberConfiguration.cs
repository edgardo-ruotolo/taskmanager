using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManager.Api.Modules.Issues.Entities;

namespace TaskManager.Api.Data.Configurations;

public class IssueSubscriberConfiguration : IEntityTypeConfiguration<IssueSubscriber>
{
    public void Configure(EntityTypeBuilder<IssueSubscriber> builder)
    {
        builder.HasKey(s => new { s.IssueId, s.UserId });

        builder.HasOne(s => s.Issue)
            .WithMany()
            .HasForeignKey(s => s.IssueId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(s => s.User)
            .WithMany()
            .HasForeignKey(s => s.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
