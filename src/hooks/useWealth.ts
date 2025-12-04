import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WealthPlan, WealthPlanInsert } from "@/types";
import { useToast } from "@/hooks/use-toast";

export function useWealthPlans(userId?: string) {
  return useQuery({
    queryKey: ["wealth-plans", userId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;
      
      if (!targetUserId) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("wealth_plans")
        .select("*")
        .eq("user_id", targetUserId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as WealthPlan[];
    },
    enabled: true,
  });
}

export function useActiveWealthPlan() {
  return useQuery({
    queryKey: ["wealth-plan", "active"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("wealth_plans")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data as WealthPlan | null;
    },
  });
}

export function useCreateWealthPlan() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (plan: Omit<WealthPlanInsert, "user_id">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("wealth_plans")
        .insert({ ...plan, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data as WealthPlan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wealth-plans"] });
      toast({ title: "Wealth plan created" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateWealthPlan() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<WealthPlan> & { id: string }) => {
      const { data, error } = await supabase
        .from("wealth_plans")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as WealthPlan;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["wealth-plans"] });
      queryClient.invalidateQueries({ queryKey: ["wealth-plan", data.id] });
      toast({ title: "Wealth plan updated" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}
