namespace TaskManager.Api.Modules.Recurring.Services;

public interface IRecurringExecutor
{
    Task ExecuteAsync(Guid templateId, CancellationToken ct = default);
}
