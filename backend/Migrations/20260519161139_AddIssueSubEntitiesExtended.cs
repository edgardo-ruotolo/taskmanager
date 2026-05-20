using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskManager.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddIssueSubEntitiesExtended : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AssigneeIdsJson",
                table: "IssueVersions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CycleId",
                table: "IssueVersions",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LabelIdsJson",
                table: "IssueVersions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MetaJson",
                table: "IssueVersions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ModuleIdsJson",
                table: "IssueVersions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PropertiesJson",
                table: "IssueVersions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsEpic",
                table: "IssueTypes",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "Level",
                table: "IssueTypes",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "LogoProps",
                table: "IssueTypes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Access",
                table: "IssueComments",
                type: "text",
                nullable: false,
                defaultValue: "Internal");

            migrationBuilder.AddColumn<DateTime>(
                name: "EditedAt",
                table: "IssueComments",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "Epoch",
                table: "IssueActivities",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<Guid>(
                name: "NewIdentifier",
                table: "IssueActivities",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "OldIdentifier",
                table: "IssueActivities",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Verb",
                table: "IssueActivities",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "IssueDescriptionVersions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    IssueId = table.Column<Guid>(type: "uuid", nullable: false),
                    OwnedById = table.Column<Guid>(type: "uuid", nullable: false),
                    DescriptionHtml = table.Column<string>(type: "text", nullable: true),
                    DescriptionJson = table.Column<string>(type: "text", nullable: true),
                    LastSavedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IssueDescriptionVersions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_IssueDescriptionVersions_AspNetUsers_OwnedById",
                        column: x => x.OwnedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_IssueDescriptionVersions_Issues_IssueId",
                        column: x => x.IssueId,
                        principalTable: "Issues",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "IssueMentions",
                columns: table => new
                {
                    IssueId = table.Column<Guid>(type: "uuid", nullable: false),
                    MentionedUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IssueMentions", x => new { x.IssueId, x.MentionedUserId });
                    table.ForeignKey(
                        name: "FK_IssueMentions_AspNetUsers_MentionedUserId",
                        column: x => x.MentionedUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_IssueMentions_Issues_IssueId",
                        column: x => x.IssueId,
                        principalTable: "Issues",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_IssueDescriptionVersions_IssueId",
                table: "IssueDescriptionVersions",
                column: "IssueId");

            migrationBuilder.CreateIndex(
                name: "IX_IssueDescriptionVersions_OwnedById",
                table: "IssueDescriptionVersions",
                column: "OwnedById");

            migrationBuilder.CreateIndex(
                name: "IX_IssueMentions_MentionedUserId",
                table: "IssueMentions",
                column: "MentionedUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "IssueDescriptionVersions");

            migrationBuilder.DropTable(
                name: "IssueMentions");

            migrationBuilder.DropColumn(
                name: "AssigneeIdsJson",
                table: "IssueVersions");

            migrationBuilder.DropColumn(
                name: "CycleId",
                table: "IssueVersions");

            migrationBuilder.DropColumn(
                name: "LabelIdsJson",
                table: "IssueVersions");

            migrationBuilder.DropColumn(
                name: "MetaJson",
                table: "IssueVersions");

            migrationBuilder.DropColumn(
                name: "ModuleIdsJson",
                table: "IssueVersions");

            migrationBuilder.DropColumn(
                name: "PropertiesJson",
                table: "IssueVersions");

            migrationBuilder.DropColumn(
                name: "IsEpic",
                table: "IssueTypes");

            migrationBuilder.DropColumn(
                name: "Level",
                table: "IssueTypes");

            migrationBuilder.DropColumn(
                name: "LogoProps",
                table: "IssueTypes");

            migrationBuilder.DropColumn(
                name: "Access",
                table: "IssueComments");

            migrationBuilder.DropColumn(
                name: "EditedAt",
                table: "IssueComments");

            migrationBuilder.DropColumn(
                name: "Epoch",
                table: "IssueActivities");

            migrationBuilder.DropColumn(
                name: "NewIdentifier",
                table: "IssueActivities");

            migrationBuilder.DropColumn(
                name: "OldIdentifier",
                table: "IssueActivities");

            migrationBuilder.DropColumn(
                name: "Verb",
                table: "IssueActivities");
        }
    }
}
