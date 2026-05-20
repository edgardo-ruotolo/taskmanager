using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskManager.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddIssueApprovalFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<List<Guid>>(
                name: "ApprovalRequiredStateIds",
                table: "Issues",
                type: "uuid[]",
                nullable: false,
                defaultValueSql: "'{}'::uuid[]");

            migrationBuilder.AddColumn<DateTime>(
                name: "ApprovedAt",
                table: "Issues",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ApprovedById",
                table: "Issues",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "RequiresAdminApproval",
                table: "Issues",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_Issues_ApprovedById",
                table: "Issues",
                column: "ApprovedById");

            migrationBuilder.AddForeignKey(
                name: "FK_Issues_AspNetUsers_ApprovedById",
                table: "Issues",
                column: "ApprovedById",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Issues_AspNetUsers_ApprovedById",
                table: "Issues");

            migrationBuilder.DropIndex(
                name: "IX_Issues_ApprovedById",
                table: "Issues");

            migrationBuilder.DropColumn(
                name: "ApprovalRequiredStateIds",
                table: "Issues");

            migrationBuilder.DropColumn(
                name: "ApprovedAt",
                table: "Issues");

            migrationBuilder.DropColumn(
                name: "ApprovedById",
                table: "Issues");

            migrationBuilder.DropColumn(
                name: "RequiresAdminApproval",
                table: "Issues");
        }
    }
}
