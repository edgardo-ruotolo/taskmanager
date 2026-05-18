using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManager.Api.Modules.Recurring.Entities;

namespace TaskManager.Api.Data.Configurations;

public class RecurringIssueTemplateConfiguration : IEntityTypeConfiguration<RecurringIssueTemplate>
{
    public void Configure(EntityTypeBuilder<RecurringIssueTemplate> builder)
    {
        builder.Property(t => t.Name).IsRequired().HasMaxLength(255);
        builder.Property(t => t.DescriptionHtml).HasDefaultValue(string.Empty);
        builder.Property(t => t.Timezone).IsRequired().HasMaxLength(100);
        builder.Property(t => t.StateGroup).IsRequired().HasMaxLength(50);
        builder.Property(t => t.Priority).IsRequired().HasMaxLength(20);
        builder.Property(t => t.Frequency).HasConversion<string>();
        builder.Property(t => t.BlockPolicy).HasConversion<string>();
        builder.Property(t => t.DaysOfWeek)
            .HasColumnType("jsonb")
            .HasDefaultValueSql("'[]'::jsonb");

        builder.HasIndex(t => new { t.WorkspaceId, t.SequenceId }).IsUnique();

        builder.HasOne(t => t.Workspace)
            .WithMany()
            .HasForeignKey(t => t.WorkspaceId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(t => t.CreatedBy)
            .WithMany()
            .HasForeignKey(t => t.CreatedById)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
