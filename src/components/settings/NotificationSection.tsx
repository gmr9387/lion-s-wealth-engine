import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Bell } from "lucide-react";

interface NotificationPreferences {
  scoreUpdates: boolean;
  disputeStatus: boolean;
  fundingOpportunities: boolean;
  actionReminders: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  scoreUpdates: true,
  disputeStatus: true,
  fundingOpportunities: true,
  actionReminders: true,
};

const NOTIFICATION_ITEMS = [
  {
    key: "scoreUpdates" as const,
    title: "Credit Score Updates",
    description: "Get notified when your score changes",
  },
  {
    key: "disputeStatus" as const,
    title: "Dispute Status",
    description: "Updates on your dispute progress",
  },
  {
    key: "fundingOpportunities" as const,
    title: "Funding Opportunities",
    description: "New funding options available",
  },
  {
    key: "actionReminders" as const,
    title: "Action Reminders",
    description: "Reminders for pending tasks",
  },
];

interface NotificationSectionProps {
  userId: string;
  initialPreferences?: NotificationPreferences | null;
}

export function NotificationSection({ userId, initialPreferences }: NotificationSectionProps) {
  const [notifications, setNotifications] = useState<NotificationPreferences>(
    initialPreferences || DEFAULT_PREFERENCES
  );

  const handleToggle = async (key: keyof NotificationPreferences, checked: boolean) => {
    const updated = { ...notifications, [key]: checked };
    setNotifications(updated);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ notification_preferences: updated })
        .eq("user_id", userId);

      if (error) throw error;
    } catch (error: any) {
      // Revert on failure
      setNotifications(notifications);
      toast({
        title: "Failed to save",
        description: "Could not update notification preferences.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <Bell className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
      </div>

      <div className="space-y-4">
        {NOTIFICATION_ITEMS.map((item) => (
          <div key={item.key} className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div>
              <p className="font-medium text-foreground">{item.title}</p>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
            <Switch
              checked={notifications[item.key]}
              onCheckedChange={(checked) => handleToggle(item.key, checked)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
