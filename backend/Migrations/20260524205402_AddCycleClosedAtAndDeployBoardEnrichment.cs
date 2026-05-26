using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskManager.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddCycleClosedAtAndDeployBoardEnrichment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Audience",
                table: "DeployBoards",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ExpiresAt",
                table: "DeployBoards",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastVisitAt",
                table: "DeployBoards",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "VisitCount",
                table: "DeployBoards",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "ClosedAt",
                table: "Cycles",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Audience",
                table: "DeployBoards");

            migrationBuilder.DropColumn(
                name: "ExpiresAt",
                table: "DeployBoards");

            migrationBuilder.DropColumn(
                name: "LastVisitAt",
                table: "DeployBoards");

            migrationBuilder.DropColumn(
                name: "VisitCount",
                table: "DeployBoards");

            migrationBuilder.DropColumn(
                name: "ClosedAt",
                table: "Cycles");
        }
    }
}
