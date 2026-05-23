namespace TaskManager.Api.Modules.Analytics.Dtos;

public record BurndownPoint(DateTime Date, int Total, int Remaining, int Completed, double Ideal);
