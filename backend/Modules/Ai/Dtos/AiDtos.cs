namespace TaskManager.Api.Modules.Ai.Dtos;

public record CompleteTextRequestDto(string Prompt);

public record CompleteTextResponseDto(string Result);

public record SuggestLabelsRequestDto(string Title, string Description);

public record SuggestLabelsResponseDto(List<string> Labels);

public record SummarizeActivityRequestDto(List<string> Items);

public record SummarizeActivityResponseDto(string Summary);

public record GenerateSubIssuesRequestDto(string Title, string Description, int Count = 5);

public record GenerateSubIssuesResponseDto(List<string> SubIssues);

public record ImproveTextRequestDto(string Text);

public record ImproveTextResponseDto(string Result);
