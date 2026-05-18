using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

namespace TaskManager.Api.Hubs;

[Authorize]
public class DocumentHub : Hub
{
    // document rooms: documentId → { userId → userName }
    private static readonly ConcurrentDictionary<string, ConcurrentDictionary<string, string>> _rooms = new();
    // latest document content per documentId
    private static readonly ConcurrentDictionary<string, string> _documents = new();

    public async Task JoinDocument(string documentId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, documentId);

        var userId = Context.UserIdentifier ?? Context.ConnectionId;
        var userName = Context.User?.Identity?.Name ?? "Anónimo";

        _rooms.GetOrAdd(documentId, _ => new()).TryAdd(userId, userName);

        // send current content to the joining client
        if (_documents.TryGetValue(documentId, out var content))
            await Clients.Caller.SendAsync("DocumentLoaded", content);

        // notify all clients in the room of updated participants list
        var participants = _rooms[documentId].Select(kvp => new { userId = kvp.Key, userName = kvp.Value });
        await Clients.Group(documentId).SendAsync("ParticipantsUpdated", participants);
    }

    public async Task LeaveDocument(string documentId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, documentId);

        var userId = Context.UserIdentifier ?? Context.ConnectionId;
        if (_rooms.TryGetValue(documentId, out var room))
        {
            room.TryRemove(userId, out _);
            var participants = room.Select(kvp => new { userId = kvp.Key, userName = kvp.Value });
            await Clients.Group(documentId).SendAsync("ParticipantsUpdated", participants);
        }
    }

    public async Task UpdateDocument(string documentId, string content)
    {
        _documents[documentId] = content;

        var userId = Context.UserIdentifier ?? Context.ConnectionId;
        // broadcast to all other clients in the room, excluding the sender
        await Clients.OthersInGroup(documentId).SendAsync("DocumentUpdated", content, userId);
    }

    public async Task SendCursor(string documentId, int from, int to)
    {
        var userId = Context.UserIdentifier ?? Context.ConnectionId;
        var userName = Context.User?.Identity?.Name ?? "Anónimo";
        await Clients.OthersInGroup(documentId).SendAsync("CursorUpdated", userId, userName, from, to);
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.UserIdentifier ?? Context.ConnectionId;
        foreach (var room in _rooms)
        {
            if (room.Value.TryRemove(userId, out _))
            {
                var participants = room.Value.Select(kvp => new { userId = kvp.Key, userName = kvp.Value });
                await Clients.Group(room.Key).SendAsync("ParticipantsUpdated", participants);
            }
        }
        await base.OnDisconnectedAsync(exception);
    }
}
