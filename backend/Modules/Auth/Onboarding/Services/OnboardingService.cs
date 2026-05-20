using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Common.Exceptions;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Auth.Onboarding.Dtos;

namespace TaskManager.Api.Modules.Auth.Onboarding.Services;

public class OnboardingService(AppDbContext db) : IOnboardingService
{
    public async Task<OnboardingStateDto> GetStateAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == userId, ct)
            ?? throw new NotFoundException("User not found.");

        return new OnboardingStateDto
        {
            CompletedSteps = user.OnboardingCompletedSteps ?? new List<string>(),
            CompletedAt = user.OnboardingCompletedAt
        };
    }

    public async Task<OnboardingStateDto> UpdateStateAsync(Guid userId, UpdateOnboardingStateDto dto, CancellationToken ct = default)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == userId, ct)
            ?? throw new NotFoundException("User not found.");

        user.OnboardingCompletedSteps = dto.CompletedSteps
            .Where(s => !string.IsNullOrWhiteSpace(s))
            .Distinct()
            .ToList();
        user.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync(ct);

        return new OnboardingStateDto
        {
            CompletedSteps = user.OnboardingCompletedSteps,
            CompletedAt = user.OnboardingCompletedAt
        };
    }

    public async Task<OnboardingStateDto> CompleteAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == userId, ct)
            ?? throw new NotFoundException("User not found.");

        user.OnboardingCompletedAt = DateTime.UtcNow;
        user.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync(ct);

        return new OnboardingStateDto
        {
            CompletedSteps = user.OnboardingCompletedSteps ?? new List<string>(),
            CompletedAt = user.OnboardingCompletedAt
        };
    }
}
