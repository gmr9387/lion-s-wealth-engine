import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CreditBureau } from "@/types";

export interface CreateTradelineData {
  creditorName: string;
  accountType: string;
  creditLimit: number;
  currentBalance: number;
  paymentStatus: string;
  isNegative: boolean;
  dateOpened?: string;
  accountNumberMasked?: string;
  bureau?: CreditBureau;
}

export function useCreateTradeline() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateTradelineData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: tradeline, error } = await supabase
        .from("tradelines")
        .insert({
          user_id: user.id,
          creditor_name: data.creditorName.trim(),
          account_type: data.accountType,
          credit_limit: data.creditLimit || null,
          current_balance: data.currentBalance || null,
          payment_status: data.paymentStatus,
          is_negative: data.isNegative,
          date_opened: data.dateOpened || null,
          account_number_masked: data.accountNumberMasked?.trim() || null,
          bureau: data.bureau || null,
        })
        .select()
        .single();

      if (error) throw error;
      return tradeline;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tradelines"] });
      queryClient.invalidateQueries({ queryKey: ["latest-scores"] });
      toast({
        title: "Tradeline added",
        description: "Your account has been added to your credit report",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteTradeline() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (tradelineId: string) => {
      const { error } = await supabase
        .from("tradelines")
        .delete()
        .eq("id", tradelineId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tradelines"] });
      toast({ title: "Tradeline removed" });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useRecordScore() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      score: number;
      bureau: CreditBureau;
      source?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: scoreRecord, error } = await supabase
        .from("score_history")
        .insert({
          user_id: user.id,
          score: data.score,
          bureau: data.bureau,
          source: data.source || "manual",
        })
        .select()
        .single();

      if (error) throw error;
      return scoreRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["score-history"] });
      queryClient.invalidateQueries({ queryKey: ["latest-scores"] });
      toast({ title: "Score recorded" });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
