import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

/**
 * Subscribes to real-time changes on score_history, disputes, and tradelines
 * tables and automatically invalidates the relevant dashboard queries.
 * Also shows user-facing toasts for meaningful events.
 */
export function useRealtimeDashboard(userId?: string) {
  const queryClient = useQueryClient();
  const initialised = useRef(false);

  useEffect(() => {
    if (!userId) return;

    // Skip toasts for the initial subscription acknowledgement
    const ready = () => initialised.current;
    // Small delay so the first data-load doesn't trigger toasts
    const timer = setTimeout(() => {
      initialised.current = true;
    }, 3000);

    const channel = supabase
      .channel("dashboard-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "score_history",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
          queryClient.invalidateQueries({ queryKey: ["score-history"] });
          if (ready()) {
            const newScore = (payload.new as any)?.score;
            const bureau = (payload.new as any)?.bureau;
            toast({
              title: "📈 Credit Score Updated",
              description: newScore
                ? `Your ${bureau ? bureau.charAt(0).toUpperCase() + bureau.slice(1) : ""} score is now ${newScore}.`
                : "A new score has been recorded.",
            });
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "disputes",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
          queryClient.invalidateQueries({ queryKey: ["disputes"] });
          if (ready()) {
            const status = (payload.new as any)?.status;
            const reason = (payload.new as any)?.reason;
            const label = reason ? reason.substring(0, 40) : "dispute";
            if (status === "resolved") {
              toast({
                title: "✅ Dispute Resolved",
                description: `Your "${label}" dispute has been resolved.`,
              });
            } else if (status === "rejected") {
              toast({
                title: "❌ Dispute Rejected",
                description: `Your "${label}" dispute was rejected.`,
                variant: "destructive",
              });
            } else if (status === "in_progress") {
              toast({
                title: "🔄 Dispute In Progress",
                description: `Your "${label}" dispute is now being reviewed.`,
              });
            }
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tradelines",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
        }
      )
      .subscribe();

    return () => {
      clearTimeout(timer);
      initialised.current = false;
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);
}
