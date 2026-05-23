using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using TaskManager.Api.Common.Auth;
using TaskManager.Api.Common.Authorization;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Common.Pagination;
using TaskManager.Api.Hubs;
using TaskManager.Api.Modules.Projects.Entities;
using TaskManager.Api.Modules.Files.Dtos;
using TaskManager.Api.Modules.Files.Services;
using TaskManager.Api.Modules.Issues.Dtos;
using TaskManager.Api.Modules.Issues.Services;

namespace TaskManager.Api.Modules.Issues.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/projects/{projectId:guid}/issues")]
[Authorize]
[ServiceFilter(typeof(RequireProjectMemberAttribute))]
public class IssuesController(
    IIssueService issueService,
    IIssueVersionService versionService,
    IIssueMentionService mentionService,
    IFileAssetService fileAssetService,
    IIssueArchiveService archiveService,
    ICurrentUser currentUser,
    IHubContext<IssueHub> issueHub) : ControllerBase
{

    [HttpPost]
    public async Task<ActionResult<IssueDto>> Create(
        string workspaceSlug, Guid projectId, [FromBody] CreateIssueDto dto, CancellationToken ct)
    {
        var issue = await issueService.CreateAsync(workspaceSlug, projectId, currentUser.UserId, dto, ct);
        return CreatedAtAction(nameof(GetById), new { workspaceSlug, projectId, issueId = issue.Id }, issue);
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<IssueDto>>> GetAll(
        string workspaceSlug, Guid projectId,
        [FromQuery] int page = 1, [FromQuery] int pageSize = 50,
        CancellationToken ct = default)
    {
        var result = await issueService.GetAllAsync(workspaceSlug, projectId, page, pageSize, ct);
        return Ok(result);
    }

    [HttpGet("{issueId:guid}")]
    public async Task<ActionResult<IssueDto>> GetById(
        string workspaceSlug, Guid projectId, Guid issueId, CancellationToken ct)
    {
        var issue = await issueService.GetByIdAsync(workspaceSlug, projectId, issueId, ct);
        return Ok(issue);
    }

    [HttpPatch("{issueId:guid}")]
    public async Task<ActionResult<IssueDto>> Update(
        string workspaceSlug, Guid projectId, Guid issueId, [FromBody] UpdateIssueDto dto, CancellationToken ct)
    {
        var issue = await issueService.UpdateAsync(workspaceSlug, projectId, issueId, dto, currentUser.UserId, ct);
        return Ok(issue);
    }

    [HttpDelete("{issueId:guid}")]
    public async Task<IActionResult> Delete(
        string workspaceSlug, Guid projectId, Guid issueId, CancellationToken ct)
    {
        await issueService.DeleteAsync(workspaceSlug, projectId, issueId, ct);
        return NoContent();
    }

    [HttpPost("{issueId:guid}/approve")]
    public async Task<ActionResult<IssueDto>> Approve(
        string workspaceSlug, Guid projectId, Guid issueId, [FromBody] ApproveIssueDto dto, CancellationToken ct)
    {
        var role = HttpContext.Items["ProjectRole"] as ProjectRole?;
        if (role is null || (role != ProjectRole.Admin && role != ProjectRole.Lead))
            return Forbid();

        var issue = await issueService.ApproveAsync(workspaceSlug, projectId, issueId, dto.TargetStateId, currentUser.UserId, ct);

        await issueHub.Clients.Group($"issue:{issueId}").SendAsync("IssueApproved", issue, ct);
        await issueHub.Clients.Group($"project:{projectId}").SendAsync("IssueApproved", issue, ct);

        return Ok(issue);
    }

    [HttpPost("{issueId:guid}/assignees")]
    public async Task<IActionResult> AddAssignee(
        string workspaceSlug, Guid projectId, Guid issueId, [FromBody] AddAssigneeDto dto, CancellationToken ct)
    {
        await issueService.AddAssigneeAsync(workspaceSlug, projectId, issueId, dto.UserId, ct);
        return NoContent();
    }

    [HttpDelete("{issueId:guid}/assignees/{userId:guid}")]
    public async Task<IActionResult> RemoveAssignee(
        string workspaceSlug, Guid projectId, Guid issueId, Guid userId, CancellationToken ct)
    {
        await issueService.RemoveAssigneeAsync(workspaceSlug, projectId, issueId, userId, ct);
        return NoContent();
    }

    [HttpPost("{issueId:guid}/labels")]
    public async Task<IActionResult> AddLabel(
        string workspaceSlug, Guid projectId, Guid issueId, [FromBody] AddLabelDto dto, CancellationToken ct)
    {
        await issueService.AddLabelAsync(workspaceSlug, projectId, issueId, dto.LabelId, ct);
        return NoContent();
    }

    [HttpDelete("{issueId:guid}/labels/{labelId:guid}")]
    public async Task<IActionResult> RemoveLabel(
        string workspaceSlug, Guid projectId, Guid issueId, Guid labelId, CancellationToken ct)
    {
        await issueService.RemoveLabelAsync(workspaceSlug, projectId, issueId, labelId, ct);
        return NoContent();
    }

    [HttpGet("archived")]
    public async Task<ActionResult<List<IssueDto>>> GetArchived(
        string workspaceSlug, Guid projectId, CancellationToken ct)
    {
        var issues = await archiveService.GetArchivedAsync(workspaceSlug, projectId, ct);
        return Ok(issues);
    }

    [HttpPost("{issueId:guid}/archive")]
    public async Task<IActionResult> Archive(
        string workspaceSlug, Guid projectId, Guid issueId, CancellationToken ct)
    {
        await archiveService.ArchiveAsync(workspaceSlug, projectId, issueId, ct);
        return NoContent();
    }

    [HttpPost("{issueId:guid}/unarchive")]
    public async Task<IActionResult> Unarchive(
        string workspaceSlug, Guid projectId, Guid issueId, CancellationToken ct)
    {
        await archiveService.UnarchiveAsync(workspaceSlug, projectId, issueId, ct);
        return NoContent();
    }

    [HttpPost("bulk-archive")]
    public async Task<IActionResult> BulkArchive(
        string workspaceSlug, Guid projectId, [FromBody] BulkArchiveDto dto, CancellationToken ct)
    {
        await archiveService.BulkArchiveAsync(workspaceSlug, projectId, dto.IssueIds, ct);
        return NoContent();
    }

    [HttpPost("bulk-delete")]
    public async Task<IActionResult> BulkDelete(
        string workspaceSlug, Guid projectId, [FromBody] BulkDeleteDto dto, CancellationToken ct)
    {
        await archiveService.BulkDeleteAsync(workspaceSlug, projectId, dto.IssueIds, ct);
        return NoContent();
    }

    [HttpPost("bulk-update")]
    public async Task<IActionResult> BulkUpdate(
        string workspaceSlug, Guid projectId, [FromBody] BulkUpdateIssueDto dto, CancellationToken ct)
    {
        await archiveService.BulkUpdateAsync(workspaceSlug, projectId, dto.IssueIds, dto, currentUser.UserId, ct);
        return NoContent();
    }

    [HttpPost("{issueId:guid}/duplicate")]
    public async Task<ActionResult<IssueDto>> Duplicate(
        string workspaceSlug, Guid projectId, Guid issueId, CancellationToken ct)
    {
        var result = await archiveService.DuplicateAsync(workspaceSlug, projectId, issueId, currentUser.UserId, ct);
        return Ok(result);
    }

    [HttpPost("search-similar")]
    public async Task<ActionResult<List<IssueDto>>> SearchSimilar(
        string workspaceSlug, Guid projectId, [FromBody] SearchSimilarIssuesDto dto, CancellationToken ct)
    {
        var results = await issueService.SearchSimilarAsync(workspaceSlug, projectId, dto.Title, ct: ct);
        return Ok(results);
    }

    // — Cycle endpoints —

    [HttpPost("{issueId:guid}/cycle")]
    public async Task<IActionResult> AttachCycle(
        Guid projectId, Guid issueId, [FromBody] AttachCycleDto dto, CancellationToken ct)
    {
        await issueService.AttachCycleAsync(projectId, issueId, dto.CycleId, currentUser.UserId, ct);
        return NoContent();
    }

    [HttpDelete("{issueId:guid}/cycle")]
    public async Task<IActionResult> DetachCycle(Guid projectId, Guid issueId, CancellationToken ct)
    {
        await issueService.DetachCycleAsync(projectId, issueId, ct);
        return NoContent();
    }

    // — Module endpoints —

    [HttpPost("{issueId:guid}/modules")]
    public async Task<IActionResult> AttachModules(
        Guid projectId, Guid issueId, [FromBody] AttachModulesDto dto, CancellationToken ct)
    {
        await issueService.AttachModulesAsync(projectId, issueId, dto.ModuleIds, currentUser.UserId, ct);
        return NoContent();
    }

    [HttpDelete("{issueId:guid}/modules/{moduleId:guid}")]
    public async Task<IActionResult> DetachModule(
        Guid projectId, Guid issueId, Guid moduleId, CancellationToken ct)
    {
        await issueService.DetachModuleAsync(projectId, issueId, moduleId, ct);
        return NoContent();
    }

    // — Attachment endpoints —

    [HttpPost("{issueId:guid}/attachments")]
    public async Task<ActionResult<FileAssetDto>> UploadAttachment(
        string workspaceSlug, Guid projectId, Guid issueId,
        IFormFile file, CancellationToken ct)
    {
        var workspace = await ResolveWorkspaceIdAsync(workspaceSlug, ct);
        var asset = await fileAssetService.UploadAsync(workspace, currentUser.UserId, file, "issue", issueId.ToString(), ct);
        return Ok(asset);
    }

    [HttpGet("{issueId:guid}/attachments")]
    public async Task<ActionResult<List<FileAssetDto>>> GetAttachments(
        string workspaceSlug, Guid projectId, Guid issueId, CancellationToken ct)
    {
        var workspace = await ResolveWorkspaceIdAsync(workspaceSlug, ct);
        var assets = await fileAssetService.GetAssetsAsync(workspace, "issue", issueId.ToString(), ct);
        return Ok(assets);
    }

    [HttpDelete("attachments/{attachmentId:guid}")]
    public async Task<IActionResult> DeleteAttachment(Guid attachmentId, CancellationToken ct)
    {
        await fileAssetService.DeleteAssetAsync(attachmentId, currentUser.UserId, ct);
        return NoContent();
    }

    // — Mention endpoints —

    [HttpPost("{issueId:guid}/mentions")]
    public async Task<IActionResult> SyncMentions(
        Guid issueId, [FromBody] CreateIssueMentionDto dto, CancellationToken ct)
    {
        await mentionService.SyncMentionsAsync(issueId, dto.MentionedUserIds, ct);
        return NoContent();
    }

    [HttpGet("{issueId:guid}/mentions")]
    public async Task<ActionResult<List<IssueMentionDto>>> GetMentions(Guid issueId, CancellationToken ct)
    {
        var mentions = await mentionService.GetMentionsAsync(issueId, ct);
        return Ok(mentions);
    }

    // — Version endpoint —

    [HttpGet("{issueId:guid}/versions")]
    public async Task<ActionResult<List<IssueVersionDto>>> GetVersions(
        string workspaceSlug, Guid projectId, Guid issueId, CancellationToken ct)
    {
        var versions = await versionService.GetVersionsAsync(workspaceSlug, projectId, issueId, ct);
        return Ok(versions);
    }

    // — Helpers —

    private async Task<Guid> ResolveWorkspaceIdAsync(string workspaceSlug, CancellationToken ct)
    {
        var workspace = await HttpContext.RequestServices
            .GetRequiredService<TaskManager.Api.Data.AppDbContext>()
            .Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new TaskManager.Api.Common.Exceptions.NotFoundException($"Workspace '{workspaceSlug}' not found.");
        return workspace.Id;
    }
}
