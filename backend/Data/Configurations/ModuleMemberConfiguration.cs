using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManager.Api.Modules.Modules.Entities;

namespace TaskManager.Api.Data.Configurations;

public class ModuleMemberConfiguration : IEntityTypeConfiguration<ModuleMember>
{
    public void Configure(EntityTypeBuilder<ModuleMember> builder)
    {
        builder.HasIndex(mm => new { mm.ModuleId, mm.UserId }).IsUnique();

        builder.HasOne(mm => mm.Module)
            .WithMany(m => m.Members)
            .HasForeignKey(mm => mm.ModuleId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(mm => mm.User)
            .WithMany()
            .HasForeignKey(mm => mm.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
