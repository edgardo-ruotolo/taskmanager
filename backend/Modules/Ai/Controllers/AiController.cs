using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Api.Common.Ai;
using TaskManager.Api.Modules.Ai.Dtos;

namespace TaskManager.Api.Modules.Ai.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/ai")]
[Authorize]
public class AiController(IAiProvider aiProvider) : ControllerBase
{
    [HttpPost("complete")]
    public async Task<ActionResult<CompleteTextResponseDto>> Complete(
        string workspaceSlug, [FromBody] CompleteTextRequestDto dto, CancellationToken ct)
    {
        var result = await aiProvider.CompleteTextAsync(dto.Prompt, ct);
        return Ok(new CompleteTextResponseDto(result));
    }

    [HttpPost("suggest-labels")]
    public async Task<ActionResult<SuggestLabelsResponseDto>> SuggestLabels(
        string workspaceSlug, [FromBody] SuggestLabelsRequestDto dto, CancellationToken ct)
    {
        var labels = await aiProvider.SuggestLabelsAsync(dto.Title, dto.Description, ct);
        return Ok(new SuggestLabelsResponseDto(labels));
    }

    [HttpPost("summarize-activity")]
    public async Task<ActionResult<SummarizeActivityResponseDto>> SummarizeActivity(
        string workspaceSlug, [FromBody] SummarizeActivityRequestDto dto, CancellationToken ct)
    {
        var summary = await aiProvider.SummarizeActivityAsync(dto.Items, ct);
        return Ok(new SummarizeActivityResponseDto(summary));
    }

    [HttpPost("generate-sub-issues")]
    public async Task<ActionResult<GenerateSubIssuesResponseDto>> GenerateSubIssues(
        string workspaceSlug, [FromBody] GenerateSubIssuesRequestDto dto, CancellationToken ct)
    {
        var subIssues = await aiProvider.GenerateSubIssuesAsync(dto.Title, dto.Description, dto.Count, ct);
        return Ok(new GenerateSubIssuesResponseDto(subIssues));
    }

    [HttpPost("improve-text")]
    public async Task<ActionResult<ImproveTextResponseDto>> ImproveText(
        string workspaceSlug, [FromBody] ImproveTextRequestDto dto, CancellationToken ct)
    {
        var result = await aiProvider.ImproveTextAsync(dto.Text, ct);
        return Ok(new ImproveTextResponseDto(result));
    }
}
