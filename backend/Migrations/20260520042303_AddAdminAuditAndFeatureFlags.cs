using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskManager.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddAdminAuditAndFeatureFlags : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "admin_audit_logs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Action = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    ActorId = table.Column<Guid>(type: "uuid", nullable: false),
                    ActorEmail = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    TargetType = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    TargetId = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    Payload = table.Column<string>(type: "jsonb", nullable: true),
                    IpAddress = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    UserAgent = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_admin_audit_logs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "feature_flags",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Key = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    Enabled = table.Column<bool>(type: "boolean", nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_feature_flags", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_admin_audit_logs_ActorId",
                table: "admin_audit_logs",
                column: "ActorId");

            migrationBuilder.CreateIndex(
                name: "IX_admin_audit_logs_TargetType",
                table: "admin_audit_logs",
                column: "TargetType");

            migrationBuilder.CreateIndex(
                name: "IX_admin_audit_logs_Timestamp",
                table: "admin_audit_logs",
                column: "Timestamp");

            migrationBuilder.CreateIndex(
                name: "IX_feature_flags_Key",
                table: "feature_flags",
                column: "Key",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "admin_audit_logs");

            migrationBuilder.DropTable(
                name: "feature_flags");
        }
    }
}
