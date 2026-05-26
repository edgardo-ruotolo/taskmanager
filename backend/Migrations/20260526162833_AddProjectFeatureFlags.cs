using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskManager.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddProjectFeatureFlags : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "ArchivesEnabled",
                table: "Projects",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "CyclesEnabled",
                table: "Projects",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IntakeEnabled",
                table: "Projects",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "ModulesEnabled",
                table: "Projects",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.Sql("UPDATE \"Projects\" SET \"CyclesEnabled\" = false, \"ModulesEnabled\" = false, \"IntakeEnabled\" = false, \"ArchivesEnabled\" = false;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ArchivesEnabled",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "CyclesEnabled",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "IntakeEnabled",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "ModulesEnabled",
                table: "Projects");
        }
    }
}
