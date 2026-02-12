import { Bell, Check, CheckCheck, Trash2, FileText, TrendingUp, Zap, Info } from "lucide-react";
import { useInboxNotifications, InboxNotification } from "@/hooks/useInboxNotifications";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const TYPE_CONFIG: Record<string, { icon: typeof Bell; color: string; label: string }> = {
  dispute_status_update: { icon: FileText, color: "text-warning", label: "Dispute" },
  score_update: { icon: TrendingUp, color: "text-success", label: "Score" },
  action_reminder: { icon: Zap, color: "text-primary", label: "Action" },
  subscription_confirmation: { icon: Check, color: "text-success", label: "Subscription" },
  subscription_cancelled: { icon: Info, color: "text-destructive", label: "Subscription" },
  welcome: { icon: Bell, color: "text-primary", label: "Welcome" },
};

function NotificationRow({
  notification,
  onRead,
  onDelete,
}: {
  notification: InboxNotification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const config = TYPE_CONFIG[notification.type] || { icon: Bell, color: "text-muted-foreground", label: "Update" };
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex items-start gap-4 p-4 rounded-lg border border-border transition-colors",
        notification.read ? "bg-card opacity-70" : "bg-card ring-1 ring-primary/20"
      )}
    >
      <div className={cn("mt-0.5 p-2 rounded-lg bg-muted flex-shrink-0", config.color)}>
        <Icon className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={cn("text-[10px] uppercase font-semibold tracking-wider", config.color)}>
            {config.label}
          </span>
          {!notification.read && (
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          )}
        </div>
        <p className="text-sm font-medium text-foreground">{notification.title}</p>
        {notification.message && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notification.message}</p>
        )}
        <p className="text-[11px] text-muted-foreground mt-1.5">
          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
        </p>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        {!notification.read && (
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onRead(notification.id)}>
            <Check className="w-4 h-4" />
          </Button>
        )}
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => onDelete(notification.id)}>
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

export default function Notifications() {
  const { notifications, isLoading, unreadCount, markAsRead, markAllAsRead, deleteNotification } =
    useInboxNotifications();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
            <p className="text-sm text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllAsRead.mutate()}
            disabled={markAllAsRead.isPending}
          >
            <CheckCheck className="w-4 h-4 mr-1.5" />
            Mark all read
          </Button>
        )}
      </div>

      {/* List */}
      <div className="space-y-2">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))
        ) : notifications.length === 0 ? (
          <div className="text-center py-16">
            <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No notifications yet</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              You'll see updates on disputes, score changes, and action items here.
            </p>
          </div>
        ) : (
          notifications.map((n) => (
            <NotificationRow
              key={n.id}
              notification={n}
              onRead={(id) => markAsRead.mutate(id)}
              onDelete={(id) => deleteNotification.mutate(id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
