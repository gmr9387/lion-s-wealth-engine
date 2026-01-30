import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";

export interface GenerateDisputeData {
  tradelineId?: string;
  bureau: "experian" | "equifax" | "transunion";
  reason: string;
  consentId: string;
}

export interface GenerateDisputeResult {
  dispute_id: string;
  status: string;
  letter_preview: string;
  human_required: boolean;
  message: string;
}

export function useGenerateDispute() {
  const [generating, setGenerating] = useState(false);
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generate = async (data: GenerateDisputeData) => {
    if (!session?.user?.id) {
      toast({
        title: "Not authenticated",
        description: "Please sign in to generate a dispute",
        variant: "destructive",
      });
      return null;
    }

    if (!data.consentId) {
      toast({
        title: "Consent required",
        description: "You must provide consent to generate a dispute",
        variant: "destructive",
      });
      return null;
    }

    setGenerating(true);

    try {
      const { data: result, error } = await supabase.functions.invoke(
        "generate-dispute",
        {
          body: {
            user_id: session.user.id,
            tradeline_id: data.tradelineId || null,
            bureau: data.bureau,
            reason: data.reason.trim(),
            consent_id: data.consentId,
          },
        }
      );

      if (error) {
        console.error("Generate dispute error:", error);
        toast({
          title: "Failed to generate dispute",
          description: error.message || "An error occurred",
          variant: "destructive",
        });
        return null;
      }

      if (result?.success && result?.data) {
        // Refresh disputes list
        queryClient.invalidateQueries({ queryKey: ["disputes"] });
        
        toast({
          title: "Dispute created",
          description: result.data.message,
        });
        return result.data as GenerateDisputeResult;
      }

      return null;
    } catch (err) {
      console.error("Error calling generate-dispute:", err);
      toast({
        title: "Error",
        description: "Failed to connect to dispute generation service",
        variant: "destructive",
      });
      return null;
    } finally {
      setGenerating(false);
    }
  };

  return {
    generate,
    generating,
  };
}
