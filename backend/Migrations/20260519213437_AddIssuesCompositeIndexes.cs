using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskManager.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddIssuesCompositeIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Issues_CompanyId_AssigneeId",
                table: "Issues",
                columns: new[] { "CompanyId", "AssigneeId" });

            migrationBuilder.CreateIndex(
                name: "IX_Issues_CompanyId_IsDeleted_IsArchived",
                table: "Issues",
                columns: new[] { "CompanyId", "IsDeleted", "IsArchived" });

            migrationBuilder.CreateIndex(
                name: "IX_Issues_CompanyId_SortOrder_CreatedAt",
                table: "Issues",
                columns: new[] { "CompanyId", "SortOrder", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Issues_CompanyId_StateId",
                table: "Issues",
                columns: new[] { "CompanyId", "StateId" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Issues_CompanyId_AssigneeId",
                table: "Issues");

            migrationBuilder.DropIndex(
                name: "IX_Issues_CompanyId_IsDeleted_IsArchived",
                table: "Issues");

            migrationBuilder.DropIndex(
                name: "IX_Issues_CompanyId_SortOrder_CreatedAt",
                table: "Issues");

            migrationBuilder.DropIndex(
                name: "IX_Issues_CompanyId_StateId",
                table: "Issues");
        }
    }
}
