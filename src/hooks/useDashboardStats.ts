import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DashboardStats {
  currentScore: number | null;
  previousScore: number | null;
  scoreChange: number;
  scoreBureau: string;
  totalCreditLimit: number;
  totalBalance: number;
  utilization: number;
  activeDisputes: number;
  negativeTradelines: number;
  totalTradelines: number;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async (): Promise<DashboardStats> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Fetch all data in parallel
      const [scoreResult, tradelinesResult, disputesResult] = await Promise.all([
        // Latest 2 scores for change calculation
        supabase
          .from("score_history")
          .select("score, bureau")
          .eq("user_id", user.id)
          .order("recorded_at", { ascending: false })
          .limit(2),

        // Tradelines for credit stats
        supabase
          .from("tradelines")
          .select("credit_limit, current_balance, is_negative")
          .eq("user_id", user.id),

        // Active disputes count
        supabase
          .from("disputes")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .in("status", ["draft", "pending_review", "submitted"]),
      ]);

      const scores = scoreResult.data || [];
      const tradelines = tradelinesResult.data || [];

      const currentScore = scores.length > 0 ? scores[0].score : null;
      const previousScore = scores.length > 1 ? scores[1].score : null;
      const scoreBureau = scores.length > 0 ? scores[0].bureau : "TransUnion";

      const totalCreditLimit = tradelines.reduce(
        (sum, t) => sum + (Number(t.credit_limit) || 0),
        0
      );
      const totalBalance = tradelines.reduce(
        (sum, t) => sum + (Number(t.current_balance) || 0),
        0
      );
      const utilization =
        totalCreditLimit > 0
          ? Math.round((totalBalance / totalCreditLimit) * 100)
          : 0;

      const negativeTradelines = tradelines.filter((t) => t.is_negative).length;

      return {
        currentScore,
        previousScore,
        scoreChange: currentScore && previousScore ? currentScore - previousScore : 0,
        scoreBureau: scoreBureau.charAt(0).toUpperCase() + scoreBureau.slice(1),
        totalCreditLimit,
        totalBalance,
        utilization,
        activeDisputes: disputesResult.count || 0,
        negativeTradelines,
        totalTradelines: tradelines.length,
      };
    },
  });
}
