using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskManager.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddProjectModuleCycleEnrichmentFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CommentBody",
                table: "WorkspaceActivities",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ClosingDate",
                table: "Projects",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsArchived",
                table: "Projects",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DueDate",
                table: "Modules",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "LeadId",
                table: "Modules",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "LeadId",
                table: "Cycles",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Modules_LeadId",
                table: "Modules",
                column: "LeadId");

            migrationBuilder.CreateIndex(
                name: "IX_Cycles_LeadId",
                table: "Cycles",
                column: "LeadId");

            migrationBuilder.AddForeignKey(
                name: "FK_Cycles_AspNetUsers_LeadId",
                table: "Cycles",
                column: "LeadId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Modules_AspNetUsers_LeadId",
                table: "Modules",
                column: "LeadId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Cycles_AspNetUsers_LeadId",
                table: "Cycles");

            migrationBuilder.DropForeignKey(
                name: "FK_Modules_AspNetUsers_LeadId",
                table: "Modules");

            migrationBuilder.DropIndex(
                name: "IX_Modules_LeadId",
                table: "Modules");

            migrationBuilder.DropIndex(
                name: "IX_Cycles_LeadId",
                table: "Cycles");

            migrationBuilder.DropColumn(
                name: "CommentBody",
                table: "WorkspaceActivities");

            migrationBuilder.DropColumn(
                name: "ClosingDate",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "IsArchived",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "DueDate",
                table: "Modules");

            migrationBuilder.DropColumn(
                name: "LeadId",
                table: "Modules");

            migrationBuilder.DropColumn(
                name: "LeadId",
                table: "Cycles");
        }
    }
}
