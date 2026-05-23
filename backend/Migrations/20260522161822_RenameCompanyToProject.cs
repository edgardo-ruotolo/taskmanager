using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskManager.Api.Migrations
{
    /// <inheritdoc />
    public partial class RenameCompanyToProject : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1) Rename tables (PostgreSQL preserves data + FK references).
            migrationBuilder.RenameTable(name: "Companies", newName: "Projects");
            migrationBuilder.RenameTable(name: "CompanyMembers", newName: "ProjectMembers");
            migrationBuilder.RenameTable(name: "CompanyInvitations", newName: "ProjectInvitations");
            migrationBuilder.RenameTable(name: "CompanyIssueTypes", newName: "ProjectIssueTypes");
            migrationBuilder.RenameTable(name: "RecurringIssueTemplateCompanies", newName: "RecurringIssueTemplateProjects");
            migrationBuilder.RenameTable(name: "ProjectModules", newName: "Modules");

            // 2) Rename CompanyId -> ProjectId in tables that kept their name.
            migrationBuilder.RenameColumn(name: "CompanyId", table: "Issues", newName: "ProjectId");
            migrationBuilder.RenameColumn(name: "CompanyId", table: "Cycles", newName: "ProjectId");
            migrationBuilder.RenameColumn(name: "CompanyId", table: "Estimates", newName: "ProjectId");
            migrationBuilder.RenameColumn(name: "CompanyId", table: "IntakeIssues", newName: "ProjectId");
            migrationBuilder.RenameColumn(name: "CompanyId", table: "DeployBoards", newName: "ProjectId");
            migrationBuilder.RenameColumn(name: "CompanyId", table: "IssueViews", newName: "ProjectId");
            migrationBuilder.RenameColumn(name: "CompanyId", table: "IssueTemplates", newName: "ProjectId");
            migrationBuilder.RenameColumn(name: "CompanyId", table: "DraftIssues", newName: "ProjectId");
            migrationBuilder.RenameColumn(name: "CompanyId", table: "ImporterHistories", newName: "ProjectId");
            migrationBuilder.RenameColumn(name: "CompanyId", table: "RecurringIssueRunIssues", newName: "ProjectId");

            // 3) Rename CompanyId -> ProjectId inside renamed tables.
            migrationBuilder.RenameColumn(name: "CompanyId", table: "ProjectMembers", newName: "ProjectId");
            migrationBuilder.RenameColumn(name: "CompanyId", table: "ProjectInvitations", newName: "ProjectId");
            migrationBuilder.RenameColumn(name: "CompanyId", table: "ProjectIssueTypes", newName: "ProjectId");
            migrationBuilder.RenameColumn(name: "CompanyId", table: "RecurringIssueTemplateProjects", newName: "ProjectId");
            migrationBuilder.RenameColumn(name: "CompanyId", table: "Modules", newName: "ProjectId");

            // 4) Rename indexes in external tables.
            migrationBuilder.RenameIndex(name: "IX_RecurringIssueRunIssues_CompanyId", table: "RecurringIssueRunIssues", newName: "IX_RecurringIssueRunIssues_ProjectId");
            migrationBuilder.RenameIndex(name: "IX_IssueViews_CompanyId", table: "IssueViews", newName: "IX_IssueViews_ProjectId");
            migrationBuilder.RenameIndex(name: "IX_Issues_CompanyId_StateId", table: "Issues", newName: "IX_Issues_ProjectId_StateId");
            migrationBuilder.RenameIndex(name: "IX_Issues_CompanyId_SortOrder_CreatedAt", table: "Issues", newName: "IX_Issues_ProjectId_SortOrder_CreatedAt");
            migrationBuilder.RenameIndex(name: "IX_Issues_CompanyId_SequenceId", table: "Issues", newName: "IX_Issues_ProjectId_SequenceId");
            migrationBuilder.RenameIndex(name: "IX_Issues_CompanyId_IsDeleted_IsArchived", table: "Issues", newName: "IX_Issues_ProjectId_IsDeleted_IsArchived");
            migrationBuilder.RenameIndex(name: "IX_Issues_CompanyId_AssigneeId", table: "Issues", newName: "IX_Issues_ProjectId_AssigneeId");
            migrationBuilder.RenameIndex(name: "IX_IntakeIssues_CompanyId", table: "IntakeIssues", newName: "IX_IntakeIssues_ProjectId");
            migrationBuilder.RenameIndex(name: "IX_ImporterHistories_CompanyId", table: "ImporterHistories", newName: "IX_ImporterHistories_ProjectId");
            migrationBuilder.RenameIndex(name: "IX_Estimates_CompanyId", table: "Estimates", newName: "IX_Estimates_ProjectId");
            migrationBuilder.RenameIndex(name: "IX_DraftIssues_CompanyId", table: "DraftIssues", newName: "IX_DraftIssues_ProjectId");
            migrationBuilder.RenameIndex(name: "IX_DeployBoards_CompanyId", table: "DeployBoards", newName: "IX_DeployBoards_ProjectId");
            migrationBuilder.RenameIndex(name: "IX_Cycles_CompanyId", table: "Cycles", newName: "IX_Cycles_ProjectId");

            // 5) Rename indexes within renamed tables.
            migrationBuilder.RenameIndex(name: "IX_Companies_OwnerId", table: "Projects", newName: "IX_Projects_OwnerId");
            migrationBuilder.RenameIndex(name: "IX_Companies_StateGroupId", table: "Projects", newName: "IX_Projects_StateGroupId");
            migrationBuilder.RenameIndex(name: "IX_Companies_WorkspaceId_Identifier", table: "Projects", newName: "IX_Projects_WorkspaceId_Identifier");

            migrationBuilder.RenameIndex(name: "IX_CompanyMembers_CompanyId_UserId", table: "ProjectMembers", newName: "IX_ProjectMembers_ProjectId_UserId");
            migrationBuilder.RenameIndex(name: "IX_CompanyMembers_UserId", table: "ProjectMembers", newName: "IX_ProjectMembers_UserId");

            migrationBuilder.RenameIndex(name: "IX_CompanyInvitations_CompanyId", table: "ProjectInvitations", newName: "IX_ProjectInvitations_ProjectId");

            migrationBuilder.RenameIndex(name: "IX_CompanyIssueTypes_IssueTypeId", table: "ProjectIssueTypes", newName: "IX_ProjectIssueTypes_IssueTypeId");

            migrationBuilder.RenameIndex(name: "IX_ProjectModules_OwnerId", table: "Modules", newName: "IX_Modules_OwnerId");
            migrationBuilder.RenameIndex(name: "IX_ProjectModules_CompanyId", table: "Modules", newName: "IX_Modules_ProjectId");

            migrationBuilder.RenameIndex(name: "IX_RecurringIssueTemplateCompanies_CompanyId", table: "RecurringIssueTemplateProjects", newName: "IX_RecurringIssueTemplateProjects_ProjectId");

            // 6) FK/PK constraint names stay with their original prefixes in PostgreSQL
            // (PG identifies relations by OID, not by constraint name). They will be
            // regenerated under the new convention next time EF needs to modify them.
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Reverse index renames.
            migrationBuilder.RenameIndex(name: "IX_RecurringIssueTemplateProjects_ProjectId", table: "RecurringIssueTemplateProjects", newName: "IX_RecurringIssueTemplateCompanies_CompanyId");

            migrationBuilder.RenameIndex(name: "IX_Modules_OwnerId", table: "Modules", newName: "IX_ProjectModules_OwnerId");
            migrationBuilder.RenameIndex(name: "IX_Modules_ProjectId", table: "Modules", newName: "IX_ProjectModules_CompanyId");

            migrationBuilder.RenameIndex(name: "IX_ProjectIssueTypes_IssueTypeId", table: "ProjectIssueTypes", newName: "IX_CompanyIssueTypes_IssueTypeId");

            migrationBuilder.RenameIndex(name: "IX_ProjectInvitations_ProjectId", table: "ProjectInvitations", newName: "IX_CompanyInvitations_CompanyId");

            migrationBuilder.RenameIndex(name: "IX_ProjectMembers_UserId", table: "ProjectMembers", newName: "IX_CompanyMembers_UserId");
            migrationBuilder.RenameIndex(name: "IX_ProjectMembers_ProjectId_UserId", table: "ProjectMembers", newName: "IX_CompanyMembers_CompanyId_UserId");

            migrationBuilder.RenameIndex(name: "IX_Projects_WorkspaceId_Identifier", table: "Projects", newName: "IX_Companies_WorkspaceId_Identifier");
            migrationBuilder.RenameIndex(name: "IX_Projects_StateGroupId", table: "Projects", newName: "IX_Companies_StateGroupId");
            migrationBuilder.RenameIndex(name: "IX_Projects_OwnerId", table: "Projects", newName: "IX_Companies_OwnerId");

            migrationBuilder.RenameIndex(name: "IX_Cycles_ProjectId", table: "Cycles", newName: "IX_Cycles_CompanyId");
            migrationBuilder.RenameIndex(name: "IX_DeployBoards_ProjectId", table: "DeployBoards", newName: "IX_DeployBoards_CompanyId");
            migrationBuilder.RenameIndex(name: "IX_DraftIssues_ProjectId", table: "DraftIssues", newName: "IX_DraftIssues_CompanyId");
            migrationBuilder.RenameIndex(name: "IX_Estimates_ProjectId", table: "Estimates", newName: "IX_Estimates_CompanyId");
            migrationBuilder.RenameIndex(name: "IX_ImporterHistories_ProjectId", table: "ImporterHistories", newName: "IX_ImporterHistories_CompanyId");
            migrationBuilder.RenameIndex(name: "IX_IntakeIssues_ProjectId", table: "IntakeIssues", newName: "IX_IntakeIssues_CompanyId");
            migrationBuilder.RenameIndex(name: "IX_Issues_ProjectId_AssigneeId", table: "Issues", newName: "IX_Issues_CompanyId_AssigneeId");
            migrationBuilder.RenameIndex(name: "IX_Issues_ProjectId_IsDeleted_IsArchived", table: "Issues", newName: "IX_Issues_CompanyId_IsDeleted_IsArchived");
            migrationBuilder.RenameIndex(name: "IX_Issues_ProjectId_SequenceId", table: "Issues", newName: "IX_Issues_CompanyId_SequenceId");
            migrationBuilder.RenameIndex(name: "IX_Issues_ProjectId_SortOrder_CreatedAt", table: "Issues", newName: "IX_Issues_CompanyId_SortOrder_CreatedAt");
            migrationBuilder.RenameIndex(name: "IX_Issues_ProjectId_StateId", table: "Issues", newName: "IX_Issues_CompanyId_StateId");
            migrationBuilder.RenameIndex(name: "IX_IssueViews_ProjectId", table: "IssueViews", newName: "IX_IssueViews_CompanyId");
            migrationBuilder.RenameIndex(name: "IX_RecurringIssueRunIssues_ProjectId", table: "RecurringIssueRunIssues", newName: "IX_RecurringIssueRunIssues_CompanyId");

            // Reverse column renames.
            migrationBuilder.RenameColumn(name: "ProjectId", table: "Modules", newName: "CompanyId");
            migrationBuilder.RenameColumn(name: "ProjectId", table: "RecurringIssueTemplateProjects", newName: "CompanyId");
            migrationBuilder.RenameColumn(name: "ProjectId", table: "ProjectIssueTypes", newName: "CompanyId");
            migrationBuilder.RenameColumn(name: "ProjectId", table: "ProjectInvitations", newName: "CompanyId");
            migrationBuilder.RenameColumn(name: "ProjectId", table: "ProjectMembers", newName: "CompanyId");

            migrationBuilder.RenameColumn(name: "ProjectId", table: "RecurringIssueRunIssues", newName: "CompanyId");
            migrationBuilder.RenameColumn(name: "ProjectId", table: "ImporterHistories", newName: "CompanyId");
            migrationBuilder.RenameColumn(name: "ProjectId", table: "DraftIssues", newName: "CompanyId");
            migrationBuilder.RenameColumn(name: "ProjectId", table: "IssueTemplates", newName: "CompanyId");
            migrationBuilder.RenameColumn(name: "ProjectId", table: "IssueViews", newName: "CompanyId");
            migrationBuilder.RenameColumn(name: "ProjectId", table: "DeployBoards", newName: "CompanyId");
            migrationBuilder.RenameColumn(name: "ProjectId", table: "IntakeIssues", newName: "CompanyId");
            migrationBuilder.RenameColumn(name: "ProjectId", table: "Estimates", newName: "CompanyId");
            migrationBuilder.RenameColumn(name: "ProjectId", table: "Cycles", newName: "CompanyId");
            migrationBuilder.RenameColumn(name: "ProjectId", table: "Issues", newName: "CompanyId");

            // Reverse table renames.
            migrationBuilder.RenameTable(name: "Modules", newName: "ProjectModules");
            migrationBuilder.RenameTable(name: "RecurringIssueTemplateProjects", newName: "RecurringIssueTemplateCompanies");
            migrationBuilder.RenameTable(name: "ProjectIssueTypes", newName: "CompanyIssueTypes");
            migrationBuilder.RenameTable(name: "ProjectInvitations", newName: "CompanyInvitations");
            migrationBuilder.RenameTable(name: "ProjectMembers", newName: "CompanyMembers");
            migrationBuilder.RenameTable(name: "Projects", newName: "Companies");
        }
    }
}
