import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface Action {
  id: string;
  title: string;
  description: string | null;
  action_type: string;
  status: "pending" | "in_progress" | "completed" | "failed" | "requires_approval" | null;
  priority: "critical" | "high" | "medium" | "low" | null;
  estimated_impact: number | null;
  due_date: string | null;
  human_required: boolean | null;
  created_at: string;
}

export function useNextBestMove() {
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const { session } = useAuth();
  const { toast } = useToast();

  // Fetch existing actions from database
  const fetchActions = async () => {
    if (!session?.user?.id) return;

    const { data, error } = await supabase
      .from("actions")
      .select("*")
      .eq("user_id", session.user.id)
      .in("status", ["pending", "in_progress"])
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching actions:", error);
      return;
    }

    setActions(data || []);
    setLoading(false);
  };

  // Generate new actions via edge function
  const generateActions = async () => {
    if (!session?.access_token) {
      toast({
        title: "Not authenticated",
        description: "Please sign in to generate actions",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke("next_best_move", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error("Error generating actions:", error);
        toast({
          title: "Error",
          description: "Failed to generate actions",
          variant: "destructive",
        });
        return;
      }

      if (data?.created?.length > 0) {
        toast({
          title: "Actions generated",
          description: `${data.created.length} new action(s) added to your queue`,
        });
        // Refresh actions list
        await fetchActions();
      } else {
        toast({
          title: "All caught up",
          description: "No new actions needed right now",
        });
      }
    } catch (err) {
      console.error("Error calling next_best_move:", err);
      toast({
        title: "Error",
        description: "Failed to connect to action engine",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  // Mark action as complete
  const completeAction = async (actionId: string) => {
    const { error } = await supabase
      .from("actions")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", actionId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to complete action",
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Action completed!" });
    await fetchActions();
  };

  // Start working on an action
  const startAction = async (actionId: string) => {
    const { error } = await supabase
      .from("actions")
      .update({ status: "in_progress" })
      .eq("id", actionId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to start action",
        variant: "destructive",
      });
      return;
    }

    await fetchActions();
  };

  // Get the top priority action (next best move)
  const nextBestMove = actions.length > 0 ? actions[0] : null;

  useEffect(() => {
    if (session?.user?.id) {
      fetchActions();
    }
  }, [session?.user?.id]);

  return {
    actions,
    nextBestMove,
    loading,
    generating,
    generateActions,
    completeAction,
    startAction,
    refetch: fetchActions,
  };
}
