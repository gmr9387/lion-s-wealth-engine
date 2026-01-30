import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface Approval {
  id: string;
  requested_by: string;
  action_id: string | null;
  dispute_id: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  decided_at: string | null;
  approved_by: string | null;
}

interface Dispute {
  id: string;
  user_id: string;
  bureau: string;
  reason: string;
  status: string;
  letter_content: string | null;
  created_at: string;
}

export function useAdminApprovals() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);
  const { session } = useAuth();
  const { toast } = useToast();

  const fetchApprovals = async () => {
    if (!session?.user?.id) return;

    setLoading(true);

    try {
      // Fetch pending admin approvals (Million Mode requests)
      const { data: approvalsData, error: approvalsError } = await supabase
        .from("admin_approvals")
        .select("*")
        .order("created_at", { ascending: false });

      if (approvalsError) {
        console.error("Error fetching approvals:", approvalsError);
      } else {
        setApprovals(approvalsData || []);
      }

      // Fetch disputes pending review
      const { data: disputesData, error: disputesError } = await supabase
        .from("disputes")
        .select("*")
        .eq("status", "pending_review")
        .order("created_at", { ascending: false });

      if (disputesError) {
        console.error("Error fetching disputes:", disputesError);
      } else {
        setDisputes(disputesData || []);
      }
    } catch (err) {
      console.error("Error in fetchApprovals:", err);
    } finally {
      setLoading(false);
    }
  };

  const approveItem = async (
    id: string,
    type: "approval" | "dispute",
    notes?: string
  ) => {
    if (!session?.user?.id) return;

    setApproving(id);

    try {
      if (type === "approval") {
        const { error } = await supabase
          .from("admin_approvals")
          .update({
            status: "approved",
            approved_by: session.user.id,
            decided_at: new Date().toISOString(),
            notes: notes || null,
          })
          .eq("id", id);

        if (error) throw error;

        toast({
          title: "Approved",
          description: "Million Mode request has been approved",
        });
      } else {
        const { error } = await supabase
          .from("disputes")
          .update({
            status: "submitted",
            submitted_at: new Date().toISOString(),
          })
          .eq("id", id);

        if (error) throw error;

        toast({
          title: "Approved & Submitted",
          description: "Dispute has been approved and marked as submitted",
        });
      }

      await fetchApprovals();
    } catch (err) {
      console.error("Error approving:", err);
      toast({
        title: "Error",
        description: "Failed to approve item",
        variant: "destructive",
      });
    } finally {
      setApproving(null);
    }
  };

  const rejectItem = async (
    id: string,
    type: "approval" | "dispute",
    notes?: string
  ) => {
    if (!session?.user?.id) return;

    setApproving(id);

    try {
      if (type === "approval") {
        const { error } = await supabase
          .from("admin_approvals")
          .update({
            status: "rejected",
            approved_by: session.user.id,
            decided_at: new Date().toISOString(),
            notes: notes || null,
          })
          .eq("id", id);

        if (error) throw error;

        toast({
          title: "Rejected",
          description: "Million Mode request has been rejected",
        });
      } else {
        const { error } = await supabase
          .from("disputes")
          .update({
            status: "rejected",
          })
          .eq("id", id);

        if (error) throw error;

        toast({
          title: "Rejected",
          description: "Dispute has been rejected",
        });
      }

      await fetchApprovals();
    } catch (err) {
      console.error("Error rejecting:", err);
      toast({
        title: "Error",
        description: "Failed to reject item",
        variant: "destructive",
      });
    } finally {
      setApproving(null);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchApprovals();
    }
  }, [session?.user?.id]);

  return {
    approvals,
    disputes,
    loading,
    approving,
    fetchApprovals,
    approveItem,
    rejectItem,
  };
}
