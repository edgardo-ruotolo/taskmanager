using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskManager.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddIssueViewsV2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_IssueViews_AspNetUsers_CreatedById",
                table: "IssueViews");

            migrationBuilder.RenameColumn(
                name: "IsGlobal",
                table: "IssueViews",
                newName: "IsPublic");

            migrationBuilder.RenameColumn(
                name: "CreatedById",
                table: "IssueViews",
                newName: "OwnerId");

            migrationBuilder.RenameIndex(
                name: "IX_IssueViews_CreatedById",
                table: "IssueViews",
                newName: "IX_IssueViews_OwnerId");

            migrationBuilder.AddColumn<Guid>(
                name: "CompanyId",
                table: "IssueViews",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DisplayPropertiesJson",
                table: "IssueViews",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Layout",
                table: "IssueViews",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "list");

            migrationBuilder.CreateTable(
                name: "InstanceConfigurations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    InstanceName = table.Column<string>(type: "text", nullable: false),
                    IsSignUpEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    IsSetupDone = table.Column<bool>(type: "boolean", nullable: false),
                    AdminEmail = table.Column<string>(type: "text", nullable: true),
                    BrevoApiKey = table.Column<string>(type: "text", nullable: true),
                    CloudinaryCloudName = table.Column<string>(type: "text", nullable: true),
                    CloudinaryApiKey = table.Column<string>(type: "text", nullable: true),
                    CloudinaryApiSecret = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InstanceConfigurations", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_IssueViews_CompanyId",
                table: "IssueViews",
                column: "CompanyId");

            migrationBuilder.AddForeignKey(
                name: "FK_IssueViews_AspNetUsers_OwnerId",
                table: "IssueViews",
                column: "OwnerId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_IssueViews_Companies_CompanyId",
                table: "IssueViews",
                column: "CompanyId",
                principalTable: "Companies",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_IssueViews_AspNetUsers_OwnerId",
                table: "IssueViews");

            migrationBuilder.DropForeignKey(
                name: "FK_IssueViews_Companies_CompanyId",
                table: "IssueViews");

            migrationBuilder.DropTable(
                name: "InstanceConfigurations");

            migrationBuilder.DropIndex(
                name: "IX_IssueViews_CompanyId",
                table: "IssueViews");

            migrationBuilder.DropColumn(
                name: "CompanyId",
                table: "IssueViews");

            migrationBuilder.DropColumn(
                name: "DisplayPropertiesJson",
                table: "IssueViews");

            migrationBuilder.DropColumn(
                name: "Layout",
                table: "IssueViews");

            migrationBuilder.RenameColumn(
                name: "OwnerId",
                table: "IssueViews",
                newName: "CreatedById");

            migrationBuilder.RenameColumn(
                name: "IsPublic",
                table: "IssueViews",
                newName: "IsGlobal");

            migrationBuilder.RenameIndex(
                name: "IX_IssueViews_OwnerId",
                table: "IssueViews",
                newName: "IX_IssueViews_CreatedById");

            migrationBuilder.AddForeignKey(
                name: "FK_IssueViews_AspNetUsers_CreatedById",
                table: "IssueViews",
                column: "CreatedById",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
