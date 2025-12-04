import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CreditReport, CreditReportInsert, Tradeline, ScoreHistory, CreditBureau } from "@/types";
import { useToast } from "@/hooks/use-toast";

export function useCreditReports(userId?: string) {
  return useQuery({
    queryKey: ["credit-reports", userId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;
      
      if (!targetUserId) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("credit_reports")
        .select("*")
        .eq("user_id", targetUserId)
        .order("report_date", { ascending: false });

      if (error) throw error;
      return data as CreditReport[];
    },
    enabled: true,
  });
}

export function useLatestCreditReport(bureau?: CreditBureau) {
  return useQuery({
    queryKey: ["credit-report", "latest", bureau],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      let query = supabase
        .from("credit_reports")
        .select("*")
        .eq("user_id", user.id)
        .order("report_date", { ascending: false })
        .limit(1);

      if (bureau) {
        query = query.eq("bureau", bureau);
      }

      const { data, error } = await query.single();

      if (error && error.code !== "PGRST116") throw error;
      return data as CreditReport | null;
    },
  });
}

export function useTradelines(creditReportId?: string) {
  return useQuery({
    queryKey: ["tradelines", creditReportId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      let query = supabase
        .from("tradelines")
        .select("*")
        .eq("user_id", user.id)
        .order("is_negative", { ascending: false })
        .order("current_balance", { ascending: false });

      if (creditReportId) {
        query = query.eq("credit_report_id", creditReportId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Tradeline[];
    },
  });
}

export function useNegativeTradelines() {
  return useQuery({
    queryKey: ["tradelines", "negative"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("tradelines")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_negative", true)
        .order("current_balance", { ascending: false });

      if (error) throw error;
      return data as Tradeline[];
    },
  });
}

export function useScoreHistory(bureau?: CreditBureau, limit = 12) {
  return useQuery({
    queryKey: ["score-history", bureau, limit],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      let query = supabase
        .from("score_history")
        .select("*")
        .eq("user_id", user.id)
        .order("recorded_at", { ascending: false })
        .limit(limit);

      if (bureau) {
        query = query.eq("bureau", bureau);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as ScoreHistory[];
    },
  });
}

export function useCreateCreditReport() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (report: Omit<CreditReportInsert, "user_id">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("credit_reports")
        .insert({ ...report, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data as CreditReport;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credit-reports"] });
      toast({ title: "Credit report imported" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useRecordScore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (scoreData: { score: number; bureau: CreditBureau; source?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("score_history")
        .insert({ 
          user_id: user.id,
          score: scoreData.score,
          bureau: scoreData.bureau,
          source: scoreData.source || "manual"
        })
        .select()
        .single();

      if (error) throw error;
      return data as ScoreHistory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["score-history"] });
    },
  });
}

export function useCreditSummary() {
  return useQuery({
    queryKey: ["credit-summary"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Get latest scores from each bureau
      const { data: scores, error: scoresError } = await supabase
        .from("score_history")
        .select("*")
        .eq("user_id", user.id)
        .order("recorded_at", { ascending: false });

      if (scoresError) throw scoresError;

      // Get tradelines summary
      const { data: tradelines, error: tradelinesError } = await supabase
        .from("tradelines")
        .select("*")
        .eq("user_id", user.id);

      if (tradelinesError) throw tradelinesError;

      // Calculate summary
      const bureauScores = {
        experian: scores?.find(s => s.bureau === "experian")?.score,
        equifax: scores?.find(s => s.bureau === "equifax")?.score,
        transunion: scores?.find(s => s.bureau === "transunion")?.score,
      };

      const totalAccounts = tradelines?.length || 0;
      const negativeItems = tradelines?.filter(t => t.is_negative).length || 0;
      const totalBalance = tradelines?.reduce((sum, t) => sum + (t.current_balance || 0), 0) || 0;
      const totalLimit = tradelines?.reduce((sum, t) => sum + (t.credit_limit || 0), 0) || 0;
      const utilization = totalLimit > 0 ? Math.round((totalBalance / totalLimit) * 100) : 0;

      return {
        bureauScores,
        averageScore: Math.round(
          (Object.values(bureauScores).filter(Boolean) as number[]).reduce((a, b) => a + b, 0) /
          Object.values(bureauScores).filter(Boolean).length || 0
        ),
        totalAccounts,
        negativeItems,
        totalBalance,
        totalLimit,
        utilization,
      };
    },
  });
}
