import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export interface FundingProjection {
  target: number;
  targetMonth: string;
  probability: number;
  requirements: string[];
  confidence: "high" | "medium" | "low";
  assumptions: string[];
}

export interface FundingTimelineResult {
  projections: FundingProjection[];
  currentProfile: {
    score: number;
    utilization: number;
    totalAccounts: number;
    negativeItems: number;
  };
  generatedAt: string;
}

export function useFundingTimeline() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FundingTimelineResult | null>(null);
  const { session, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const calculateProjections = async (targets?: number[]) => {
    if (!session?.user?.id) {
      toast({
        title: "Not authenticated",
        description: "Please sign in to calculate funding projections",
        variant: "destructive",
      });
      return null;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("funding-timeline", {
        body: {
          user_id: session.user.id,
          targets,
        },
      });

      if (error) {
        console.error("Funding timeline error:", error);
        toast({
          title: "Calculation failed",
          description: "Failed to calculate funding projections",
          variant: "destructive",
        });
        return null;
      }

      if (data?.success && data?.data) {
        setResult(data.data);
        toast({
          title: "Projections calculated",
          description: `${data.data.projections.length} funding milestones analyzed`,
        });
        return data.data as FundingTimelineResult;
      }

      return null;
    } catch (err) {
      console.error("Error calling funding-timeline:", err);
      toast({
        title: "Error",
        description: "Failed to connect to funding projection service",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    calculateProjections,
    loading,
    authLoading,
    result,
    clearResult: () => setResult(null),
  };
}
