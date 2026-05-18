using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskManager.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddArchivesAndDrafts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ArchivedAt",
                table: "ProjectModules",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsArchived",
                table: "ProjectModules",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "ArchivedAt",
                table: "Issues",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsArchived",
                table: "Issues",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "ArchivedAt",
                table: "Cycles",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsArchived",
                table: "Cycles",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "DraftIssues",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Priority = table.Column<int>(type: "integer", nullable: false),
                    CompanyId = table.Column<Guid>(type: "uuid", nullable: false),
                    StateId = table.Column<Guid>(type: "uuid", nullable: true),
                    OwnedById = table.Column<Guid>(type: "uuid", nullable: false),
                    AssigneeId = table.Column<Guid>(type: "uuid", nullable: true),
                    DueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DraftIssues", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DraftIssues_AspNetUsers_AssigneeId",
                        column: x => x.AssigneeId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_DraftIssues_AspNetUsers_OwnedById",
                        column: x => x.OwnedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DraftIssues_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Companies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DraftIssues_States_StateId",
                        column: x => x.StateId,
                        principalTable: "States",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_DraftIssues_AssigneeId",
                table: "DraftIssues",
                column: "AssigneeId");

            migrationBuilder.CreateIndex(
                name: "IX_DraftIssues_CompanyId",
                table: "DraftIssues",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_DraftIssues_OwnedById",
                table: "DraftIssues",
                column: "OwnedById");

            migrationBuilder.CreateIndex(
                name: "IX_DraftIssues_StateId",
                table: "DraftIssues",
                column: "StateId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DraftIssues");

            migrationBuilder.DropColumn(
                name: "ArchivedAt",
                table: "ProjectModules");

            migrationBuilder.DropColumn(
                name: "IsArchived",
                table: "ProjectModules");

            migrationBuilder.DropColumn(
                name: "ArchivedAt",
                table: "Issues");

            migrationBuilder.DropColumn(
                name: "IsArchived",
                table: "Issues");

            migrationBuilder.DropColumn(
                name: "ArchivedAt",
                table: "Cycles");

            migrationBuilder.DropColumn(
                name: "IsArchived",
                table: "Cycles");
        }
    }
}
