namespace TaskManager.Api.Modules.Auth.Onboarding.Dtos;

public class OnboardingStateDto
{
    public List<string> CompletedSteps { get; set; } = new();
    public DateTime? CompletedAt { get; set; }
}
