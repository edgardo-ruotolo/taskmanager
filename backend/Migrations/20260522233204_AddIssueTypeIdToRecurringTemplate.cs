using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskManager.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddIssueTypeIdToRecurringTemplate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "IssueTypeId",
                table: "RecurringIssueTemplates",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_RecurringIssueTemplates_IssueTypeId",
                table: "RecurringIssueTemplates",
                column: "IssueTypeId");

            migrationBuilder.AddForeignKey(
                name: "FK_RecurringIssueTemplates_IssueTypes_IssueTypeId",
                table: "RecurringIssueTemplates",
                column: "IssueTypeId",
                principalTable: "IssueTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RecurringIssueTemplates_IssueTypes_IssueTypeId",
                table: "RecurringIssueTemplates");

            migrationBuilder.DropIndex(
                name: "IX_RecurringIssueTemplates_IssueTypeId",
                table: "RecurringIssueTemplates");

            migrationBuilder.DropColumn(
                name: "IssueTypeId",
                table: "RecurringIssueTemplates");
        }
    }
}
