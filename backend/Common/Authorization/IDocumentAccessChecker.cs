namespace TaskManager.Api.Common.Authorization;

public interface IDocumentAccessChecker
{
    Task<bool> HasAccessAsync(string documentId, Guid userId, CancellationToken ct = default);
}
