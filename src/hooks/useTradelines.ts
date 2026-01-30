import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Tradeline {
  id: string;
  creditorName: string;
  accountType: string;
  creditLimit: number;
  currentBalance: number;
  paymentStatus: string;
  isNegative: boolean;
  dateOpened: string;
  utilization: number;
  bureau: string | null;
}

export interface ScoreHistoryPoint {
  date: string;
  score: number;
  bureau: string;
  projected?: boolean;
}

export function useTradelines() {
  return useQuery({
    queryKey: ["tradelines"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("tradelines")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform to UI format
      return (data || []).map((t): Tradeline => ({
        id: t.id,
        creditorName: t.creditor_name,
        accountType: t.account_type || "Unknown",
        creditLimit: t.credit_limit || 0,
        currentBalance: t.current_balance || 0,
        paymentStatus: t.payment_status || "Unknown",
        isNegative: t.is_negative || false,
        dateOpened: t.date_opened 
          ? new Date(t.date_opened).toLocaleDateString("en-US", { month: "short", year: "numeric" })
          : "Unknown",
        utilization: t.credit_limit && t.current_balance 
          ? Math.round((t.current_balance / t.credit_limit) * 100) 
          : 0,
        bureau: t.bureau,
      }));
    },
  });
}

export function useScoreHistory() {
  return useQuery({
    queryKey: ["score-history"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("score_history")
        .select("*")
        .eq("user_id", user.id)
        .order("recorded_at", { ascending: true })
        .limit(12);

      if (error) throw error;

      return (data || []).map((s): ScoreHistoryPoint => ({
        date: new Date(s.recorded_at).toLocaleDateString("en-US", { month: "short" }),
        score: s.score,
        bureau: s.bureau,
      }));
    },
  });
}

export function useLatestScores() {
  return useQuery({
    queryKey: ["latest-scores"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get the most recent score for each bureau
      const bureaus = ["experian", "transunion", "equifax"] as const;
      const scores: { bureau: string; score: number | null; change: number }[] = [];

      for (const bureau of bureaus) {
        const { data } = await supabase
          .from("score_history")
          .select("*")
          .eq("user_id", user.id)
          .eq("bureau", bureau)
          .order("recorded_at", { ascending: false })
          .limit(2);

        if (data && data.length > 0) {
          const current = data[0].score;
          const previous = data.length > 1 ? data[1].score : current;
          scores.push({
            bureau: bureau.charAt(0).toUpperCase() + bureau.slice(1),
            score: current,
            change: current - previous,
          });
        }
      }

      return scores;
    },
  });
}
