using System.Collections.Concurrent;

namespace TaskManager.Api.Common.Caching;

/// <summary>
/// Process-local implementation of <see cref="IRoomStateStore"/>.
/// Suitable for single-node deployments and development.
/// </summary>
public class InMemoryRoomStateStore : IRoomStateStore
{
    private readonly ConcurrentDictionary<string, ConcurrentDictionary<string, string>> _rooms = new();
    private readonly ConcurrentDictionary<string, string> _documents = new();

    public Task<string?> GetDocumentContentAsync(string documentId, CancellationToken ct = default)
    {
        _documents.TryGetValue(documentId, out var content);
        return Task.FromResult<string?>(content);
    }

    public Task SetDocumentContentAsync(string documentId, string content, CancellationToken ct = default)
    {
        _documents[documentId] = content;
        return Task.CompletedTask;
    }

    public Task AddParticipantAsync(string documentId, string userId, string userName, CancellationToken ct = default)
    {
        _rooms.GetOrAdd(documentId, _ => new ConcurrentDictionary<string, string>())[userId] = userName;
        return Task.CompletedTask;
    }

    public Task RemoveParticipantAsync(string documentId, string userId, CancellationToken ct = default)
    {
        if (_rooms.TryGetValue(documentId, out var room))
            room.TryRemove(userId, out _);
        return Task.CompletedTask;
    }

    public Task<IReadOnlyDictionary<string, string>> GetParticipantsAsync(string documentId, CancellationToken ct = default)
    {
        if (_rooms.TryGetValue(documentId, out var room))
            return Task.FromResult<IReadOnlyDictionary<string, string>>(room.ToDictionary(kv => kv.Key, kv => kv.Value));
        return Task.FromResult<IReadOnlyDictionary<string, string>>(new Dictionary<string, string>());
    }
}
