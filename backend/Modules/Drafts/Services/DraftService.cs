using Microsoft.EntityFrameworkCore;
using Npgsql;
using TaskManager.Api.Common.Exceptions;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Drafts.Dtos;
using TaskManager.Api.Modules.Drafts.Entities;
using TaskManager.Api.Modules.Issues.Dtos;
using TaskManager.Api.Modules.Issues.Entities;

namespace TaskManager.Api.Modules.Drafts.Services;

public class DraftService(AppDbContext db, IConfiguration configuration) : IDraftService
{
    public async Task<List<DraftIssueDto>> GetAllAsync(string workspaceSlug, Guid userId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        return await db.DraftIssues
            .Include(d => d.State)
            .Where(d => d.OwnedById == userId && d.Project.WorkspaceId == workspace.Id)
            .OrderByDescending(d => d.CreatedAt)
            .Select(d => MapToDto(d))
            .ToListAsync(ct);
    }

    public async Task<DraftIssueDto> GetByIdAsync(string workspaceSlug, Guid draftId, Guid userId, CancellationToken ct = default)
    {
        var draft = await db.DraftIssues
            .Include(d => d.State)
            .FirstOrDefaultAsync(d => d.Id == draftId && d.OwnedById == userId, ct)
            ?? throw new NotFoundException("Draft not found.");

        return MapToDto(draft);
    }

    public async Task<DraftIssueDto> CreateAsync(string workspaceSlug, Guid userId, CreateDraftIssueDto dto, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var project = await db.Projects.FirstOrDefaultAsync(c => c.Id == dto.ProjectId && c.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Project not found.");

        var draft = new DraftIssue
        {
            Title = dto.Title,
            Description = dto.Description,
            Priority = dto.Priority,
            ProjectId = project.Id,
            StateId = dto.StateId,
            OwnedById = userId,
            AssigneeId = dto.AssigneeId,
            DueDate = dto.DueDate
        };

        db.DraftIssues.Add(draft);
        await db.SaveChangesAsync(ct);

        if (draft.StateId.HasValue)
            draft.State = await db.States.FindAsync([draft.StateId.Value], ct);

        return MapToDto(draft);
    }

    public async Task<DraftIssueDto> UpdateAsync(string workspaceSlug, Guid draftId, Guid userId, UpdateDraftIssueDto dto, CancellationToken ct = default)
    {
        var draft = await db.DraftIssues
            .Include(d => d.State)
            .FirstOrDefaultAsync(d => d.Id == draftId && d.OwnedById == userId, ct)
            ?? throw new NotFoundException("Draft not found.");

        if (dto.Title is not null) draft.Title = dto.Title;
        if (dto.Description is not null) draft.Description = dto.Description;
        if (dto.Priority is not null) draft.Priority = dto.Priority.Value;
        if (dto.AssigneeId is not null) draft.AssigneeId = dto.AssigneeId;
        if (dto.DueDate is not null) draft.DueDate = dto.DueDate;

        if (dto.StateId is not null)
        {
            var state = await db.States.FindAsync([dto.StateId.Value], ct)
                ?? throw new NotFoundException($"State {dto.StateId} not found.");
            draft.StateId = state.Id;
            draft.State = state;
        }

        await db.SaveChangesAsync(ct);
        return MapToDto(draft);
    }

    public async Task DeleteAsync(string workspaceSlug, Guid draftId, Guid userId, CancellationToken ct = default)
    {
        var draft = await db.DraftIssues
            .FirstOrDefaultAsync(d => d.Id == draftId && d.OwnedById == userId, ct)
            ?? throw new NotFoundException("Draft not found.");

        draft.IsDeleted = true;
        draft.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
    }

    public async Task<object> PublishAsync(string workspaceSlug, Guid draftId, Guid userId, CancellationToken ct = default)
    {
        var draft = await db.DraftIssues
            .Include(d => d.State)
            .FirstOrDefaultAsync(d => d.Id == draftId && d.OwnedById == userId, ct)
            ?? throw new NotFoundException("Draft not found.");

        if (draft.StateId is null)
            throw new ValidationException("Draft must have a state before publishing.");

        var state = await db.States.FindAsync([draft.StateId.Value], ct)
            ?? throw new NotFoundException($"State {draft.StateId} not found.");

        var connString = configuration.GetConnectionString("Postgres")!;
        int sequenceId;

        await using var conn = new NpgsqlConnection(connString);
        await conn.OpenAsync(ct);
        await using var tx = await conn.BeginTransactionAsync(ct);

        var lockKey = BitConverter.ToInt64(draft.ProjectId.ToByteArray(), 0);
        await using (var lockCmd = new NpgsqlCommand($"SELECT pg_advisory_xact_lock({lockKey})", conn, tx))
            await lockCmd.ExecuteNonQueryAsync(ct);

        await using (var seqCmd = new NpgsqlCommand(
            "SELECT COALESCE(MAX(\"SequenceId\"), 0) + 1 FROM \"Issues\" WHERE \"ProjectId\" = @projectId",
            conn, tx))
        {
            seqCmd.Parameters.AddWithValue("projectId", draft.ProjectId);
            sequenceId = Convert.ToInt32(await seqCmd.ExecuteScalarAsync(ct));
        }

        await tx.CommitAsync(ct);
        await conn.CloseAsync();

        var issue = new Issue
        {
            Title = draft.Title,
            Description = draft.Description,
            Priority = draft.Priority,
            StateId = state.Id,
            State = state,
            ProjectId = draft.ProjectId,
            CreatedById = userId,
            SequenceId = sequenceId,
            AssigneeId = draft.AssigneeId,
            DueDate = draft.DueDate
        };

        db.Issues.Add(issue);

        draft.IsDeleted = true;
        draft.DeletedAt = DateTime.UtcNow;

        await db.SaveChangesAsync(ct);

        return new IssueDto
        {
            Id = issue.Id,
            SequenceId = issue.SequenceId,
            Title = issue.Title,
            Description = issue.Description,
            Priority = issue.Priority,
            ProjectId = issue.ProjectId,
            StateId = issue.StateId,
            StateName = state.Name,
            StateColor = state.Color,
            StateGroup = state.Category.ToString(),
            CreatedById = issue.CreatedById,
            AssigneeId = issue.AssigneeId,
            AssigneeIds = [],
            LabelIds = [],
            DueDate = issue.DueDate,
            IsArchived = false,
            CreatedAt = issue.CreatedAt,
            UpdatedAt = issue.UpdatedAt
        };
    }

    private static DraftIssueDto MapToDto(DraftIssue draft) => new()
    {
        Id = draft.Id,
        Title = draft.Title,
        Description = draft.Description,
        Priority = draft.Priority,
        ProjectId = draft.ProjectId,
        StateId = draft.StateId,
        StateName = draft.State?.Name,
        OwnedById = draft.OwnedById,
        AssigneeId = draft.AssigneeId,
        DueDate = draft.DueDate,
        CreatedAt = draft.CreatedAt,
        UpdatedAt = draft.UpdatedAt
    };
}
