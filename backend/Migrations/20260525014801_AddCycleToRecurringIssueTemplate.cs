using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskManager.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddCycleToRecurringIssueTemplate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "CycleId",
                table: "RecurringIssueTemplates",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_RecurringIssueTemplates_CycleId",
                table: "RecurringIssueTemplates",
                column: "CycleId");

            migrationBuilder.AddForeignKey(
                name: "FK_RecurringIssueTemplates_Cycles_CycleId",
                table: "RecurringIssueTemplates",
                column: "CycleId",
                principalTable: "Cycles",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RecurringIssueTemplates_Cycles_CycleId",
                table: "RecurringIssueTemplates");

            migrationBuilder.DropIndex(
                name: "IX_RecurringIssueTemplates_CycleId",
                table: "RecurringIssueTemplates");

            migrationBuilder.DropColumn(
                name: "CycleId",
                table: "RecurringIssueTemplates");
        }
    }
}
