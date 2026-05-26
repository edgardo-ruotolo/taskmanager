namespace TaskManager.Api.Modules.Notifications.Constants;

/// <summary>
/// Canonical (Type, Property) pairs used in <c>UserNotificationPreference</c> rows.
/// The dispatcher reads these to decide whether to send an email to a recipient.
/// </summary>
public static class NotificationEventTypes
{
    // Type values
    public const string TypeIssue = "issue";
    public const string TypeComment = "comment";
    public const string TypeCycle = "cycle";
    public const string TypeLeader = "leader";
    public const string TypeDigest = "digest";

    // Property values per type
    public const string PropAssigned = "assigned";
    public const string PropMention = "mention";
    public const string PropStateChanged = "state_changed";
    public const string PropDueSoon = "due_soon";
    public const string PropCreated = "created";

    public const string PropStart = "start";
    public const string PropEnd = "end";

    public const string PropOverdue = "overdue";
    public const string PropMidpoint = "midpoint";
    public const string PropApprovalPending = "approval_pending";

    public const string PropDaily = "daily";
}
