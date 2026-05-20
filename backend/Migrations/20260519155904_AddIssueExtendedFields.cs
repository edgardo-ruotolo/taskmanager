using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskManager.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddIssueExtendedFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CompletedAt",
                table: "Issues",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DescriptionHtml",
                table: "Issues",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DescriptionJson",
                table: "Issues",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "EstimatePointId",
                table: "Issues",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ExternalId",
                table: "Issues",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ExternalSource",
                table: "Issues",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDraft",
                table: "Issues",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "Point",
                table: "Issues",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "SortOrder",
                table: "Issues",
                type: "double precision",
                nullable: false,
                defaultValue: 65535.0);

            migrationBuilder.AddColumn<DateTime>(
                name: "StartDate",
                table: "Issues",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedById",
                table: "Issues",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Issues_EstimatePointId",
                table: "Issues",
                column: "EstimatePointId");

            migrationBuilder.CreateIndex(
                name: "IX_Issues_UpdatedById",
                table: "Issues",
                column: "UpdatedById");

            migrationBuilder.AddForeignKey(
                name: "FK_Issues_AspNetUsers_UpdatedById",
                table: "Issues",
                column: "UpdatedById",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Issues_EstimatePoints_EstimatePointId",
                table: "Issues",
                column: "EstimatePointId",
                principalTable: "EstimatePoints",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Issues_AspNetUsers_UpdatedById",
                table: "Issues");

            migrationBuilder.DropForeignKey(
                name: "FK_Issues_EstimatePoints_EstimatePointId",
                table: "Issues");

            migrationBuilder.DropIndex(
                name: "IX_Issues_EstimatePointId",
                table: "Issues");

            migrationBuilder.DropIndex(
                name: "IX_Issues_UpdatedById",
                table: "Issues");

            migrationBuilder.DropColumn(
                name: "CompletedAt",
                table: "Issues");

            migrationBuilder.DropColumn(
                name: "DescriptionHtml",
                table: "Issues");

            migrationBuilder.DropColumn(
                name: "DescriptionJson",
                table: "Issues");

            migrationBuilder.DropColumn(
                name: "EstimatePointId",
                table: "Issues");

            migrationBuilder.DropColumn(
                name: "ExternalId",
                table: "Issues");

            migrationBuilder.DropColumn(
                name: "ExternalSource",
                table: "Issues");

            migrationBuilder.DropColumn(
                name: "IsDraft",
                table: "Issues");

            migrationBuilder.DropColumn(
                name: "Point",
                table: "Issues");

            migrationBuilder.DropColumn(
                name: "SortOrder",
                table: "Issues");

            migrationBuilder.DropColumn(
                name: "StartDate",
                table: "Issues");

            migrationBuilder.DropColumn(
                name: "UpdatedById",
                table: "Issues");
        }
    }
}
