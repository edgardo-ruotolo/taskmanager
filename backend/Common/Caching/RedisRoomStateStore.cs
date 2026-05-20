using StackExchange.Redis;

namespace TaskManager.Api.Common.Caching;

/// <summary>
/// Redis-backed implementation of <see cref="IRoomStateStore"/>. Used when the
/// process is horizontally scaled so that DocumentHub sessions can survive a
/// node restart and that participant rosters stay coherent across instances.
/// </summary>
public class RedisRoomStateStore : IRoomStateStore
{
    private readonly IConnectionMultiplexer _redis;
    private const string DocumentKeyPrefix = "doc:content:";
    private const string ParticipantsKeyPrefix = "doc:participants:";
    private static readonly TimeSpan DocumentTtl = TimeSpan.FromHours(24);

    public RedisRoomStateStore(IConnectionMultiplexer redis)
    {
        _redis = redis;
    }

    private IDatabase Db => _redis.GetDatabase();

    public async Task<string?> GetDocumentContentAsync(string documentId, CancellationToken ct = default)
    {
        var value = await Db.StringGetAsync(DocumentKeyPrefix + documentId);
        return value.HasValue ? value.ToString() : null;
    }

    public Task SetDocumentContentAsync(string documentId, string content, CancellationToken ct = default)
        => Db.StringSetAsync(DocumentKeyPrefix + documentId, content, DocumentTtl);

    public Task AddParticipantAsync(string documentId, string userId, string userName, CancellationToken ct = default)
        => Db.HashSetAsync(ParticipantsKeyPrefix + documentId, userId, userName);

    public Task RemoveParticipantAsync(string documentId, string userId, CancellationToken ct = default)
        => Db.HashDeleteAsync(ParticipantsKeyPrefix + documentId, userId).ContinueWith(_ => { }, ct);

    public async Task<IReadOnlyDictionary<string, string>> GetParticipantsAsync(string documentId, CancellationToken ct = default)
    {
        var entries = await Db.HashGetAllAsync(ParticipantsKeyPrefix + documentId);
        return entries.ToDictionary(e => e.Name.ToString(), e => e.Value.ToString());
    }
}
