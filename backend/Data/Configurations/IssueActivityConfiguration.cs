using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManager.Api.Modules.Issues.Entities;

namespace TaskManager.Api.Data.Configurations;

public class IssueActivityConfiguration : IEntityTypeConfiguration<IssueActivity>
{
    public void Configure(EntityTypeBuilder<IssueActivity> builder)
    {
        builder.Property(a => a.Field).IsRequired().HasMaxLength(100);
        builder.Property(a => a.OldValue).HasMaxLength(1000);
        builder.Property(a => a.NewValue).HasMaxLength(1000);

        builder.HasOne(a => a.Issue)
            .WithMany(i => i.Activities)
            .HasForeignKey(a => a.IssueId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(a => a.Actor)
            .WithMany()
            .HasForeignKey(a => a.ActorId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
