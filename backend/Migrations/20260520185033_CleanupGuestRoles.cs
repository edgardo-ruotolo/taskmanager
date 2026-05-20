using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskManager.Api.Migrations
{
    /// <inheritdoc />
    public partial class CleanupGuestRoles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"UPDATE ""WorkspaceMembers"" SET ""Role"" = 15 WHERE ""Role"" = 5;");
            migrationBuilder.Sql(@"UPDATE ""CompanyMembers"" SET ""Role"" = 15 WHERE ""Role"" = 5;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
        }
    }
}
