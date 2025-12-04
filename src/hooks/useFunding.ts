import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FundingProjection, FundingProjectionInsert } from "@/types";
import { useToast } from "@/hooks/use-toast";

export function useFundingProjections(userId?: string) {
  return useQuery({
    queryKey: ["funding-projections", userId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;
      
      if (!targetUserId) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("funding_projections")
        .select("*")
        .eq("user_id", targetUserId)
        .order("target_amount", { ascending: true });

      if (error) throw error;
      return data as FundingProjection[];
    },
    enabled: true,
  });
}

export function useFundingProjection(projectionId: string) {
  return useQuery({
    queryKey: ["funding-projection", projectionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("funding_projections")
        .select("*")
        .eq("id", projectionId)
        .single();

      if (error) throw error;
      return data as FundingProjection;
    },
    enabled: !!projectionId,
  });
}

export function useCreateFundingProjection() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (projection: Omit<FundingProjectionInsert, "user_id">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("funding_projections")
        .insert({ ...projection, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data as FundingProjection;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["funding-projections"] });
      toast({ title: "Funding projection created" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateFundingProjection() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<FundingProjection> & { id: string }) => {
      const { data, error } = await supabase
        .from("funding_projections")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as FundingProjection;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["funding-projections"] });
      queryClient.invalidateQueries({ queryKey: ["funding-projection", data.id] });
      toast({ title: "Projection updated" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteFundingProjection() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (projectionId: string) => {
      const { error } = await supabase
        .from("funding_projections")
        .delete()
        .eq("id", projectionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["funding-projections"] });
      toast({ title: "Projection deleted" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

// Funding calculation utilities
export function calculateFundingProbability(
  currentScore: number,
  targetAmount: number,
  monthsAvailable: number
): { probability: number; confidence: "high" | "medium" | "low"; requirements: string[] } {
  const requirements: string[] = [];
  let probability = 0;

  // Base probability from credit score
  if (currentScore >= 750) probability = 95;
  else if (currentScore >= 720) probability = 85;
  else if (currentScore >= 680) probability = 70;
  else if (currentScore >= 640) probability = 50;
  else if (currentScore >= 600) probability = 30;
  else probability = 15;

  // Adjust for target amount
  if (targetAmount > 100000) {
    probability -= 25;
    requirements.push("Business entity required");
    requirements.push("Tax returns (2 years)");
    requirements.push("Bank statements (12 months)");
  } else if (targetAmount > 50000) {
    probability -= 15;
    requirements.push("Income verification");
    requirements.push("Bank statements (6 months)");
  } else if (targetAmount > 25000) {
    probability -= 10;
    requirements.push("Proof of income");
  }

  // Adjust for time available
  if (monthsAvailable < 3 && currentScore < 680) {
    probability -= 20;
    requirements.push("Score improvement needed");
  }

  // Score requirements based on amount
  if (targetAmount > 100000 && currentScore < 720) {
    requirements.push(`Score 720+ required`);
  } else if (targetAmount > 50000 && currentScore < 680) {
    requirements.push(`Score 680+ required`);
  } else if (targetAmount > 25000 && currentScore < 640) {
    requirements.push(`Score 640+ required`);
  }

  // Determine confidence
  const confidence = probability >= 70 ? "high" : probability >= 40 ? "medium" : "low";

  return {
    probability: Math.max(5, Math.min(95, probability)),
    confidence,
    requirements,
  };
}
