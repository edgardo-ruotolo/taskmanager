namespace TaskManager.Api.Modules.Recurring.Services;

public interface IRecurringDispatcher
{
    Task DispatchDueTemplatesAsync(CancellationToken ct = default);
}
