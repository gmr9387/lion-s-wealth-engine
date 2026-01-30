import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export interface FundingSequenceStep {
  id: string;
  step: number;
  provider: string;
  product: string;
  action: string;
  expectedAmount: number;
  timing: string;
  requirements: string[];
  riskLevel: "low" | "medium" | "high";
  humanRequired: boolean;
}

export interface MillionModeResult {
  sequence: FundingSequenceStep[];
  projectedTotal: number;
  riskLevel: "low" | "medium" | "high";
  warnings: string[];
  maxHardPulls48h: number;
  estimatedDuration: string;
  status: string;
  approvalId?: string;
  humanRequired: boolean;
  message: string;
}

export function useMillionMode() {
  const [activating, setActivating] = useState(false);
  const [result, setResult] = useState<MillionModeResult | null>(null);
  const { session } = useAuth();
  const { toast } = useToast();

  const activate = async (consentId: string) => {
    if (!session?.user?.id) {
      toast({
        title: "Not authenticated",
        description: "Please sign in to activate Million Mode",
        variant: "destructive",
      });
      return null;
    }

    if (!consentId) {
      toast({
        title: "Consent required",
        description: "You must provide consent to activate Million Mode",
        variant: "destructive",
      });
      return null;
    }

    setActivating(true);

    try {
      const { data, error } = await supabase.functions.invoke("million-mode", {
        body: {
          user_id: session.user.id,
          consent_id: consentId,
        },
      });

      if (error) {
        console.error("Million Mode error:", error);
        toast({
          title: "Activation failed",
          description: "Failed to activate Million Mode",
          variant: "destructive",
        });
        return null;
      }

      if (data?.success && data?.data) {
        setResult(data.data);
        toast({
          title: "Million Mode activated",
          description: data.data.message,
        });
        return data.data as MillionModeResult;
      }

      return null;
    } catch (err) {
      console.error("Error calling million-mode:", err);
      toast({
        title: "Error",
        description: "Failed to connect to Million Mode service",
        variant: "destructive",
      });
      return null;
    } finally {
      setActivating(false);
    }
  };

  return {
    activate,
    activating,
    result,
    clearResult: () => setResult(null),
  };
}
