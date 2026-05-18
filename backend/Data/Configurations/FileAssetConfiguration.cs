using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManager.Api.Modules.Files.Entities;

namespace TaskManager.Api.Data.Configurations;

public class FileAssetConfiguration : IEntityTypeConfiguration<FileAsset>
{
    public void Configure(EntityTypeBuilder<FileAsset> builder)
    {
        builder.Property(f => f.FileName).IsRequired().HasMaxLength(500);
        builder.Property(f => f.ContentType).IsRequired().HasMaxLength(200);

        builder.HasIndex(f => f.WorkspaceId);

        builder.HasOne(f => f.UploadedBy)
            .WithMany()
            .HasForeignKey(f => f.UploadedById)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(f => f.Workspace)
            .WithMany()
            .HasForeignKey(f => f.WorkspaceId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
