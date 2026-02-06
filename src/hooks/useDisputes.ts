import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dispute, DisputeInsert, DisputeUpdate, DisputeStatus } from "@/types";
import { useToast } from "@/hooks/use-toast";

export function useDisputes(userId?: string) {
  return useQuery({
    queryKey: ["disputes", userId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;
      
      if (!targetUserId) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("disputes")
        .select(`
          *,
          tradelines (
            creditor_name,
            account_type,
            current_balance
          )
        `)
        .eq("user_id", targetUserId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as (Dispute & { tradelines: { creditor_name: string; account_type: string; current_balance: number } | null })[];
    },
    enabled: true,
  });
}

export function useDispute(disputeId: string) {
  return useQuery({
    queryKey: ["dispute", disputeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("disputes")
        .select(`
          *,
          tradelines (*)
        `)
        .eq("id", disputeId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!disputeId,
  });
}

export function useCreateDispute() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (dispute: Omit<DisputeInsert, "user_id">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("disputes")
        .insert({ 
          ...dispute, 
          user_id: user.id,
          human_required: true, // Always requires human review
          status: "draft" as DisputeStatus
        })
        .select()
        .single();

      if (error) throw error;
      return data as Dispute;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disputes"] });
      toast({ 
        title: "Dispute created", 
        description: "Your dispute has been saved as a draft and requires review" 
      });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateDispute() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: DisputeUpdate & { id: string; sendNotification?: boolean; creditorName?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("disputes")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Send email notification if status changed and user wants notification
      if (updates.status && user) {
        try {
          await supabase.functions.invoke("send-notification", {
            body: {
              type: "dispute_status_update",
              userId: user.id,
              data: {
                status: updates.status,
                creditorName: updates.creditorName || "Account",
              },
            },
          });
        } catch (e) {
          console.error("Failed to send notification:", e);
        }
      }

      return data as Dispute;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["disputes"] });
      queryClient.invalidateQueries({ queryKey: ["dispute", data.id] });
      toast({ title: "Dispute updated" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useSubmitDispute() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ disputeId, consentId }: { disputeId: string; consentId: string }) => {
      const { data, error } = await supabase
        .from("disputes")
        .update({ 
          status: "pending_review" as DisputeStatus,
          consent_id: consentId,
          submitted_at: new Date().toISOString()
        })
        .eq("id", disputeId)
        .select()
        .single();

      if (error) throw error;
      return data as Dispute;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disputes"] });
      toast({ 
        title: "Dispute submitted", 
        description: "Your dispute is now pending admin review" 
      });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useDisputesByStatus(status: DisputeStatus) {
  return useQuery({
    queryKey: ["disputes", "status", status],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("disputes")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", status)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Dispute[];
    },
  });
}
