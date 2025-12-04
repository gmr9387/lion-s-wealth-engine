import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Action, ActionInsert, ActionUpdate, ActionStatus } from "@/types";
import { useToast } from "@/hooks/use-toast";

export function useActions(userId?: string) {
  return useQuery({
    queryKey: ["actions", userId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;
      
      if (!targetUserId) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("actions")
        .select("*")
        .eq("user_id", targetUserId)
        .order("priority", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Action[];
    },
    enabled: true,
  });
}

export function useAction(actionId: string) {
  return useQuery({
    queryKey: ["action", actionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("actions")
        .select("*")
        .eq("id", actionId)
        .single();

      if (error) throw error;
      return data as Action;
    },
    enabled: !!actionId,
  });
}

export function useCreateAction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (action: Omit<ActionInsert, "user_id">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("actions")
        .insert({ ...action, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data as Action;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["actions"] });
      toast({ title: "Action created", description: "New action added to your queue" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateAction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: ActionUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("actions")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Action;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["actions"] });
      queryClient.invalidateQueries({ queryKey: ["action", data.id] });
      toast({ title: "Action updated" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useCompleteAction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (actionId: string) => {
      const { data, error } = await supabase
        .from("actions")
        .update({ 
          status: "completed" as ActionStatus, 
          completed_at: new Date().toISOString() 
        })
        .eq("id", actionId)
        .select()
        .single();

      if (error) throw error;
      return data as Action;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["actions"] });
      toast({ title: "Action completed", description: "Great progress!" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteAction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (actionId: string) => {
      const { error } = await supabase
        .from("actions")
        .delete()
        .eq("id", actionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["actions"] });
      toast({ title: "Action deleted" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}
