using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManager.Api.Modules.Recurring.Entities;

namespace TaskManager.Api.Data.Configurations;

public class RecurringIssueTemplateCompanyConfiguration : IEntityTypeConfiguration<RecurringIssueTemplateCompany>
{
    public void Configure(EntityTypeBuilder<RecurringIssueTemplateCompany> builder)
    {
        builder.HasKey(x => new { x.TemplateId, x.CompanyId });

        builder.HasOne(x => x.Template)
            .WithMany(t => t.Companies)
            .HasForeignKey(x => x.TemplateId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Company)
            .WithMany()
            .HasForeignKey(x => x.CompanyId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class RecurringIssueTemplateAssigneeConfiguration : IEntityTypeConfiguration<RecurringIssueTemplateAssignee>
{
    public void Configure(EntityTypeBuilder<RecurringIssueTemplateAssignee> builder)
    {
        builder.HasKey(x => new { x.TemplateId, x.AssigneeId });

        builder.HasOne(x => x.Template)
            .WithMany(t => t.Assignees)
            .HasForeignKey(x => x.TemplateId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Assignee)
            .WithMany()
            .HasForeignKey(x => x.AssigneeId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class RecurringIssueTemplateLabelConfiguration : IEntityTypeConfiguration<RecurringIssueTemplateLabel>
{
    public void Configure(EntityTypeBuilder<RecurringIssueTemplateLabel> builder)
    {
        builder.HasKey(x => new { x.TemplateId, x.LabelId });

        builder.HasOne(x => x.Template)
            .WithMany(t => t.Labels)
            .HasForeignKey(x => x.TemplateId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Label)
            .WithMany()
            .HasForeignKey(x => x.LabelId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
