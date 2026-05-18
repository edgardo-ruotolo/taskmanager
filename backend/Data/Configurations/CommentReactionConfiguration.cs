using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManager.Api.Modules.Issues.Entities;

namespace TaskManager.Api.Data.Configurations;

public class CommentReactionConfiguration : IEntityTypeConfiguration<CommentReaction>
{
    public void Configure(EntityTypeBuilder<CommentReaction> builder)
    {
        builder.Property(r => r.Emoji).IsRequired().HasMaxLength(10);

        builder.HasIndex(r => new { r.CommentId, r.ActorId, r.Emoji }).IsUnique();

        builder.HasOne(r => r.Comment)
            .WithMany(c => c.Reactions)
            .HasForeignKey(r => r.CommentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(r => r.Actor)
            .WithMany()
            .HasForeignKey(r => r.ActorId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
