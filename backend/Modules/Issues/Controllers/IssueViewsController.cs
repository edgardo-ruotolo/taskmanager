using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Api.Common.Auth;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using TaskManager.Api.Common.Exceptions;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Issues.Dtos;
using TaskManager.Api.Modules.Issues.Entities;
using TaskManager.Api.Modules.Issues.Services;

namespace TaskManager.Api.Modules.Issues.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/views")]
[Authorize]
public class IssueViewsController(IIssueViewService viewService, AppDbContext db, ICurrentUser currentUser) : ControllerBase
{

    [HttpGet]
    public async Task<ActionResult<IEnumerable<IssueViewDto>>> GetViews(
        string workspaceSlug,
        [FromQuery] Guid? projectId,
        CancellationToken ct)
    {
        var views = await viewService.GetAllAsync(workspaceSlug, projectId, currentUser.UserId, ct);
        return Ok(views);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<IssueViewDto>> GetView(string workspaceSlug, Guid id, CancellationToken ct)
    {
        var view = await viewService.GetByIdAsync(id, currentUser.UserId, ct);
        return Ok(view);
    }

    [HttpPost]
    public async Task<ActionResult<IssueViewDto>> CreateView(
        string workspaceSlug,
        [FromBody] CreateIssueViewDto dto,
        CancellationToken ct)
    {
        var view = await viewService.CreateAsync(workspaceSlug, currentUser.UserId, dto, ct);
        return CreatedAtAction(nameof(GetView), new { workspaceSlug, id = view.Id }, view);
    }

    [HttpPatch("{id:guid}")]
    public async Task<ActionResult<IssueViewDto>> UpdateView(
        string workspaceSlug,
        Guid id,
        [FromBody] UpdateIssueViewDto dto,
        CancellationToken ct)
    {
        var view = await viewService.UpdateAsync(id, currentUser.UserId, dto, ct);
        return Ok(view);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteView(string workspaceSlug, Guid id, CancellationToken ct)
    {
        await viewService.DeleteAsync(id, currentUser.UserId, ct);
        return NoContent();
    }

    [HttpGet("{id:guid}/issues")]
    public async Task<ActionResult<IEnumerable<IssueDto>>> GetViewIssues(
        string workspaceSlug, Guid id, CancellationToken ct)
    {
        var view = await db.IssueViews.FirstOrDefaultAsync(v => v.Id == id, ct)
            ?? throw new NotFoundException("View not found.");

        if (!view.IsPublic && view.OwnerId != currentUser.UserId)
            throw new ForbiddenException("Access denied.");

        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        IQueryable<Issue> query = db.Issues
            .Include(i => i.State)
            .Include(i => i.Assignees)
            .Include(i => i.Labels)
            .Where(i => i.Project.WorkspaceId == workspace.Id);

        if (view.ProjectId.HasValue)
            query = query.Where(i => i.ProjectId == view.ProjectId.Value);

        // Apply filters stored in FiltersJson
        if (!string.IsNullOrWhiteSpace(view.FiltersJson) && view.FiltersJson != "{}")
        {
            try
            {
                var filters = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(view.FiltersJson);
                if (filters is not null)
                {
                    if (filters.TryGetValue("stateIds", out var stateIds))
                    {
                        var ids = stateIds.Deserialize<List<Guid>>();
                        if (ids is { Count: > 0 })
                            query = query.Where(i => ids.Contains(i.StateId));
                    }

                    if (filters.TryGetValue("priority", out var priorities))
                    {
                        var priorityList = priorities.Deserialize<List<int>>();
                        if (priorityList is { Count: > 0 })
                            query = query.Where(i => priorityList.Contains((int)i.Priority));
                    }

                    if (filters.TryGetValue("assigneeIds", out var assigneeIds))
                    {
                        var ids = assigneeIds.Deserialize<List<Guid>>();
                        if (ids is { Count: > 0 })
                            query = query.Where(i => i.Assignees.Any(a => ids.Contains(a.UserId)));
                    }

                    if (filters.TryGetValue("labelIds", out var labelIds))
                    {
                        var ids = labelIds.Deserialize<List<Guid>>();
                        if (ids is { Count: > 0 })
                            query = query.Where(i => i.Labels.Any(l => ids.Contains(l.LabelId)));
                    }
                }
            }
            catch (JsonException)
            {
                // If filters JSON is malformed, return unfiltered results
            }
        }

        var issues = await query
            .OrderBy(i => i.SortOrder)
            .Select(i => new IssueDto
            {
                Id = i.Id,
                SequenceId = i.SequenceId,
                Title = i.Title,
                Description = i.Description,
                DescriptionHtml = i.DescriptionHtml,
                DescriptionJson = i.DescriptionJson,
                Priority = i.Priority,
                ProjectId = i.ProjectId,
                StateId = i.StateId,
                StateName = i.State.Name,
                StateColor = i.State.Color,
                StateGroup = i.State.Category.ToString(),
                CreatedById = i.CreatedById,
                UpdatedById = i.UpdatedById,
                AssigneeId = i.AssigneeId,
                AssigneeIds = i.Assignees.Select(a => a.UserId).ToList(),
                LabelIds = i.Labels.Select(l => l.LabelId).ToList(),
                ParentId = i.ParentId,
                IssueTypeId = i.IssueTypeId,
                EstimatePointId = i.EstimatePointId,
                Point = i.Point,
                StartDate = i.StartDate,
                DueDate = i.DueDate,
                CompletedAt = i.CompletedAt,
                SortOrder = i.SortOrder,
                IsDraft = i.IsDraft,
                IsArchived = i.IsArchived,
                ArchivedAt = i.ArchivedAt,
                ExternalSource = i.ExternalSource,
                ExternalId = i.ExternalId,
                CreatedAt = i.CreatedAt,
                UpdatedAt = i.UpdatedAt
            })
            .ToListAsync(ct);

        return Ok(issues);
    }
}
