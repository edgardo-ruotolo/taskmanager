using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManager.Api.Modules.Issues.Entities;

namespace TaskManager.Api.Data.Configurations;

public class ProjectIssueTypeConfiguration : IEntityTypeConfiguration<ProjectIssueType>
{
    public void Configure(EntityTypeBuilder<ProjectIssueType> builder)
    {
        builder.HasKey(cit => new { cit.ProjectId, cit.IssueTypeId });

        builder.HasOne(cit => cit.Project)
            .WithMany()
            .HasForeignKey(cit => cit.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(cit => cit.IssueType)
            .WithMany()
            .HasForeignKey(cit => cit.IssueTypeId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
