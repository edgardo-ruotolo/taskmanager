using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Api.Common.Auth;
using TaskManager.Api.Modules.Auth.Onboarding.Dtos;
using TaskManager.Api.Modules.Auth.Onboarding.Services;

namespace TaskManager.Api.Modules.Auth.Onboarding.Controllers;

[ApiController]
[Authorize]
[Route("api/onboarding")]
public class OnboardingController(IOnboardingService onboardingService, ICurrentUser currentUser) : ControllerBase
{
    [HttpGet("state")]
    public async Task<ActionResult<OnboardingStateDto>> GetState(CancellationToken ct)
    {
        var state = await onboardingService.GetStateAsync(currentUser.UserId, ct);
        return Ok(state);
    }

    [HttpPut("state")]
    public async Task<ActionResult<OnboardingStateDto>> UpdateState([FromBody] UpdateOnboardingStateDto dto, CancellationToken ct)
    {
        var state = await onboardingService.UpdateStateAsync(currentUser.UserId, dto, ct);
        return Ok(state);
    }

    [HttpPost("complete")]
    public async Task<ActionResult<OnboardingStateDto>> Complete(CancellationToken ct)
    {
        var state = await onboardingService.CompleteAsync(currentUser.UserId, ct);
        return Ok(state);
    }
}
