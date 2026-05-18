using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManager.Api.Modules.Issues.Entities;

namespace TaskManager.Api.Data.Configurations;

public class IssueReactionConfiguration : IEntityTypeConfiguration<IssueReaction>
{
    public void Configure(EntityTypeBuilder<IssueReaction> builder)
    {
        builder.Property(r => r.Emoji).IsRequired().HasMaxLength(10);

        builder.HasIndex(r => new { r.IssueId, r.ActorId, r.Emoji }).IsUnique();

        builder.HasOne(r => r.Issue)
            .WithMany(i => i.Reactions)
            .HasForeignKey(r => r.IssueId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.Actor)
            .WithMany()
            .HasForeignKey(r => r.ActorId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
