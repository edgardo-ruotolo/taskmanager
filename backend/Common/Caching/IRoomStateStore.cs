namespace TaskManager.Api.Common.Caching;

/// <summary>
/// Stores DocumentHub state (per-document content snapshot + participants
/// roster) in a backend that can be shared across multiple API instances.
/// In-memory implementation works for single-node dev; Redis implementation
/// is required for horizontally-scaled production.
/// </summary>
public interface IRoomStateStore
{
    Task<string?> GetDocumentContentAsync(string documentId, CancellationToken ct = default);
    Task SetDocumentContentAsync(string documentId, string content, CancellationToken ct = default);

    Task AddParticipantAsync(string documentId, string userId, string userName, CancellationToken ct = default);
    Task RemoveParticipantAsync(string documentId, string userId, CancellationToken ct = default);
    Task<IReadOnlyDictionary<string, string>> GetParticipantsAsync(string documentId, CancellationToken ct = default);
}
