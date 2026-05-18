using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskManager.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddStateGroups : Migration
    {
        private static readonly Guid DefaultGroupId = Guid.Parse("a1b2c3d4-e5f6-7890-abcd-ef1234567890");

        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. Create StateGroups table first
            migrationBuilder.CreateTable(
                name: "StateGroups",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    IsDefault = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StateGroups", x => x.Id);
                });

            // 2. Insert default "Estados Básicos" group
            migrationBuilder.Sql($"""
                INSERT INTO "StateGroups" ("Id", "Name", "Description", "IsDefault", "IsDeleted", "CreatedAt", "UpdatedAt")
                VALUES ('{DefaultGroupId}', 'Estados Básicos', NULL, true, false, NOW(), NOW())
                """);

            // 3. Rename States.Group → States.Category
            migrationBuilder.RenameColumn(
                name: "Group",
                table: "States",
                newName: "Category");

            // 4. Add StateGroupId to States (nullable first for backfill)
            migrationBuilder.AddColumn<Guid>(
                name: "StateGroupId",
                table: "States",
                type: "uuid",
                nullable: true);

            // 5. Backfill existing States with default group
            migrationBuilder.Sql($"""UPDATE "States" SET "StateGroupId" = '{DefaultGroupId}'""");

            // 6. Make StateGroupId NOT NULL
            migrationBuilder.AlterColumn<Guid>(
                name: "StateGroupId",
                table: "States",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            // 7. Add StateGroupId to Companies (nullable first for backfill)
            migrationBuilder.AddColumn<Guid>(
                name: "StateGroupId",
                table: "Companies",
                type: "uuid",
                nullable: true);

            // 8. Backfill existing Companies with default group
            migrationBuilder.Sql($"""UPDATE "Companies" SET "StateGroupId" = '{DefaultGroupId}'""");

            // 9. Make StateGroupId NOT NULL
            migrationBuilder.AlterColumn<Guid>(
                name: "StateGroupId",
                table: "Companies",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            // 10. Indexes
            migrationBuilder.CreateIndex(
                name: "IX_States_StateGroupId",
                table: "States",
                column: "StateGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_Companies_StateGroupId",
                table: "Companies",
                column: "StateGroupId");

            // 11. FKs
            migrationBuilder.AddForeignKey(
                name: "FK_Companies_StateGroups_StateGroupId",
                table: "Companies",
                column: "StateGroupId",
                principalTable: "StateGroups",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_States_StateGroups_StateGroupId",
                table: "States",
                column: "StateGroupId",
                principalTable: "StateGroups",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Companies_StateGroups_StateGroupId",
                table: "Companies");

            migrationBuilder.DropForeignKey(
                name: "FK_States_StateGroups_StateGroupId",
                table: "States");

            migrationBuilder.DropIndex(
                name: "IX_States_StateGroupId",
                table: "States");

            migrationBuilder.DropIndex(
                name: "IX_Companies_StateGroupId",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "StateGroupId",
                table: "States");

            migrationBuilder.DropColumn(
                name: "StateGroupId",
                table: "Companies");

            migrationBuilder.RenameColumn(
                name: "Category",
                table: "States",
                newName: "Group");

            migrationBuilder.DropTable(
                name: "StateGroups");
        }
    }
}
