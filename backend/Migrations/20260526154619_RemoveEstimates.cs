using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskManager.Api.Migrations
{
    /// <inheritdoc />
    public partial class RemoveEstimates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Issues_EstimatePoints_EstimatePointId",
                table: "Issues");

            migrationBuilder.DropTable(
                name: "EstimatePoints");

            migrationBuilder.DropTable(
                name: "Estimates");

            migrationBuilder.DropIndex(
                name: "IX_Issues_EstimatePointId",
                table: "Issues");

            migrationBuilder.DropColumn(
                name: "EstimatePointId",
                table: "Issues");

            migrationBuilder.DropColumn(
                name: "Point",
                table: "Issues");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "EstimatePointId",
                table: "Issues",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Point",
                table: "Issues",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Estimates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProjectId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Type = table.Column<string>(type: "text", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Estimates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Estimates_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EstimatePoints",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EstimateId = table.Column<Guid>(type: "uuid", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Key = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    Value = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EstimatePoints", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EstimatePoints_Estimates_EstimateId",
                        column: x => x.EstimateId,
                        principalTable: "Estimates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Issues_EstimatePointId",
                table: "Issues",
                column: "EstimatePointId");

            migrationBuilder.CreateIndex(
                name: "IX_EstimatePoints_EstimateId",
                table: "EstimatePoints",
                column: "EstimateId");

            migrationBuilder.CreateIndex(
                name: "IX_Estimates_ProjectId",
                table: "Estimates",
                column: "ProjectId");

            migrationBuilder.AddForeignKey(
                name: "FK_Issues_EstimatePoints_EstimatePointId",
                table: "Issues",
                column: "EstimatePointId",
                principalTable: "EstimatePoints",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
