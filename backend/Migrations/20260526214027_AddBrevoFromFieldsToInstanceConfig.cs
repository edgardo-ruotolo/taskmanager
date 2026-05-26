using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskManager.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddBrevoFromFieldsToInstanceConfig : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BrevoFromEmail",
                table: "InstanceConfigurations",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BrevoFromName",
                table: "InstanceConfigurations",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BrevoFromEmail",
                table: "InstanceConfigurations");

            migrationBuilder.DropColumn(
                name: "BrevoFromName",
                table: "InstanceConfigurations");
        }
    }
}
