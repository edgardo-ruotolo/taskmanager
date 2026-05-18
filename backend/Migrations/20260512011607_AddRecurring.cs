using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskManager.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddRecurring : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "RecurringIssueTemplates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SequenceId = table.Column<int>(type: "integer", nullable: false),
                    WorkspaceId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    DescriptionHtml = table.Column<string>(type: "text", nullable: false, defaultValue: ""),
                    Frequency = table.Column<string>(type: "text", nullable: false),
                    Interval = table.Column<int>(type: "integer", nullable: false),
                    DaysOfWeek = table.Column<int[]>(type: "jsonb", nullable: false, defaultValueSql: "'[]'::jsonb"),
                    DayOfMonth = table.Column<int>(type: "integer", nullable: true),
                    MonthOfYear = table.Column<int>(type: "integer", nullable: true),
                    RunAtTime = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    EndTime = table.Column<TimeOnly>(type: "time without time zone", nullable: true),
                    Timezone = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    StartsOn = table.Column<DateOnly>(type: "date", nullable: false),
                    EndsOn = table.Column<DateOnly>(type: "date", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsPaused = table.Column<bool>(type: "boolean", nullable: false),
                    SkipNextRun = table.Column<bool>(type: "boolean", nullable: false),
                    LastRunAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    NextRunAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    StateGroup = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Priority = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    StartDateOffsetDays = table.Column<int>(type: "integer", nullable: false),
                    TargetDateOffsetDays = table.Column<int>(type: "integer", nullable: false),
                    BlockPolicy = table.Column<string>(type: "text", nullable: false),
                    CreatedById = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RecurringIssueTemplates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RecurringIssueTemplates_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RecurringIssueTemplates_Workspaces_WorkspaceId",
                        column: x => x.WorkspaceId,
                        principalTable: "Workspaces",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RecurringIssueRuns",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    WorkspaceId = table.Column<Guid>(type: "uuid", nullable: false),
                    TemplateId = table.Column<Guid>(type: "uuid", nullable: false),
                    ScheduledFor = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ExecutedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    ErrorMessage = table.Column<string>(type: "text", nullable: false, defaultValue: ""),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RecurringIssueRuns", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RecurringIssueRuns_RecurringIssueTemplates_TemplateId",
                        column: x => x.TemplateId,
                        principalTable: "RecurringIssueTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RecurringIssueRuns_Workspaces_WorkspaceId",
                        column: x => x.WorkspaceId,
                        principalTable: "Workspaces",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RecurringIssueTemplateAssignees",
                columns: table => new
                {
                    TemplateId = table.Column<Guid>(type: "uuid", nullable: false),
                    AssigneeId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RecurringIssueTemplateAssignees", x => new { x.TemplateId, x.AssigneeId });
                    table.ForeignKey(
                        name: "FK_RecurringIssueTemplateAssignees_AspNetUsers_AssigneeId",
                        column: x => x.AssigneeId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RecurringIssueTemplateAssignees_RecurringIssueTemplates_Tem~",
                        column: x => x.TemplateId,
                        principalTable: "RecurringIssueTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RecurringIssueTemplateCompanies",
                columns: table => new
                {
                    TemplateId = table.Column<Guid>(type: "uuid", nullable: false),
                    CompanyId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RecurringIssueTemplateCompanies", x => new { x.TemplateId, x.CompanyId });
                    table.ForeignKey(
                        name: "FK_RecurringIssueTemplateCompanies_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Companies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RecurringIssueTemplateCompanies_RecurringIssueTemplates_Tem~",
                        column: x => x.TemplateId,
                        principalTable: "RecurringIssueTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RecurringIssueTemplateLabels",
                columns: table => new
                {
                    TemplateId = table.Column<Guid>(type: "uuid", nullable: false),
                    LabelId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RecurringIssueTemplateLabels", x => new { x.TemplateId, x.LabelId });
                    table.ForeignKey(
                        name: "FK_RecurringIssueTemplateLabels_Labels_LabelId",
                        column: x => x.LabelId,
                        principalTable: "Labels",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RecurringIssueTemplateLabels_RecurringIssueTemplates_Templa~",
                        column: x => x.TemplateId,
                        principalTable: "RecurringIssueTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "recurring_issue_run_blocked_issues",
                columns: table => new
                {
                    BlockedByIssuesId = table.Column<Guid>(type: "uuid", nullable: false),
                    RecurringIssueRunId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_recurring_issue_run_blocked_issues", x => new { x.BlockedByIssuesId, x.RecurringIssueRunId });
                    table.ForeignKey(
                        name: "FK_recurring_issue_run_blocked_issues_Issues_BlockedByIssuesId",
                        column: x => x.BlockedByIssuesId,
                        principalTable: "Issues",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_recurring_issue_run_blocked_issues_RecurringIssueRuns_Recur~",
                        column: x => x.RecurringIssueRunId,
                        principalTable: "RecurringIssueRuns",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RecurringIssueRunIssues",
                columns: table => new
                {
                    RunId = table.Column<Guid>(type: "uuid", nullable: false),
                    IssueId = table.Column<Guid>(type: "uuid", nullable: false),
                    CompanyId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RecurringIssueRunIssues", x => new { x.RunId, x.IssueId });
                    table.ForeignKey(
                        name: "FK_RecurringIssueRunIssues_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Companies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RecurringIssueRunIssues_Issues_IssueId",
                        column: x => x.IssueId,
                        principalTable: "Issues",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RecurringIssueRunIssues_RecurringIssueRuns_RunId",
                        column: x => x.RunId,
                        principalTable: "RecurringIssueRuns",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_recurring_issue_run_blocked_issues_RecurringIssueRunId",
                table: "recurring_issue_run_blocked_issues",
                column: "RecurringIssueRunId");

            migrationBuilder.CreateIndex(
                name: "IX_RecurringIssueRunIssues_CompanyId",
                table: "RecurringIssueRunIssues",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_RecurringIssueRunIssues_IssueId",
                table: "RecurringIssueRunIssues",
                column: "IssueId");

            migrationBuilder.CreateIndex(
                name: "IX_RecurringIssueRuns_TemplateId",
                table: "RecurringIssueRuns",
                column: "TemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_RecurringIssueRuns_WorkspaceId",
                table: "RecurringIssueRuns",
                column: "WorkspaceId");

            migrationBuilder.CreateIndex(
                name: "IX_RecurringIssueTemplateAssignees_AssigneeId",
                table: "RecurringIssueTemplateAssignees",
                column: "AssigneeId");

            migrationBuilder.CreateIndex(
                name: "IX_RecurringIssueTemplateCompanies_CompanyId",
                table: "RecurringIssueTemplateCompanies",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_RecurringIssueTemplateLabels_LabelId",
                table: "RecurringIssueTemplateLabels",
                column: "LabelId");

            migrationBuilder.CreateIndex(
                name: "IX_RecurringIssueTemplates_CreatedById",
                table: "RecurringIssueTemplates",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_RecurringIssueTemplates_WorkspaceId_SequenceId",
                table: "RecurringIssueTemplates",
                columns: new[] { "WorkspaceId", "SequenceId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "recurring_issue_run_blocked_issues");

            migrationBuilder.DropTable(
                name: "RecurringIssueRunIssues");

            migrationBuilder.DropTable(
                name: "RecurringIssueTemplateAssignees");

            migrationBuilder.DropTable(
                name: "RecurringIssueTemplateCompanies");

            migrationBuilder.DropTable(
                name: "RecurringIssueTemplateLabels");

            migrationBuilder.DropTable(
                name: "RecurringIssueRuns");

            migrationBuilder.DropTable(
                name: "RecurringIssueTemplates");
        }
    }
}
