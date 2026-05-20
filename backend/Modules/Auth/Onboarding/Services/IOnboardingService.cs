using TaskManager.Api.Modules.Auth.Onboarding.Dtos;

namespace TaskManager.Api.Modules.Auth.Onboarding.Services;

public interface IOnboardingService
{
    Task<OnboardingStateDto> GetStateAsync(Guid userId, CancellationToken ct = default);
    Task<OnboardingStateDto> UpdateStateAsync(Guid userId, UpdateOnboardingStateDto dto, CancellationToken ct = default);
    Task<OnboardingStateDto> CompleteAsync(Guid userId, CancellationToken ct = default);
}
