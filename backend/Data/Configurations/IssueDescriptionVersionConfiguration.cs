using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManager.Api.Modules.Issues.Entities;

namespace TaskManager.Api.Data.Configurations;

public class IssueDescriptionVersionConfiguration : IEntityTypeConfiguration<IssueDescriptionVersion>
{
    public void Configure(EntityTypeBuilder<IssueDescriptionVersion> builder)
    {
        builder.HasOne(v => v.Issue)
            .WithMany()
            .HasForeignKey(v => v.IssueId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(v => v.OwnedBy)
            .WithMany()
            .HasForeignKey(v => v.OwnedById)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(v => v.DescriptionHtml).HasColumnType("text");
        builder.Property(v => v.DescriptionJson).HasColumnType("text");
    }
}
