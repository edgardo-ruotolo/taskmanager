namespace TaskManager.Api.Modules.Auth.Onboarding.Dtos;

public class UpdateOnboardingStateDto
{
    public List<string> CompletedSteps { get; set; } = new();
}
