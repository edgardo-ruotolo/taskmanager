using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManager.Api.Modules.Templates.Entities;

namespace TaskManager.Api.Data.Configurations;

public class IssueTemplateConfiguration : IEntityTypeConfiguration<IssueTemplate>
{
    public void Configure(EntityTypeBuilder<IssueTemplate> builder)
    {
        builder.Property(t => t.Name).IsRequired().HasMaxLength(255);
        builder.Property(t => t.TemplateJson).HasColumnType("text");

        builder.HasOne(t => t.Workspace)
            .WithMany()
            .HasForeignKey(t => t.WorkspaceId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
