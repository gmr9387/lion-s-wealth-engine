import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export interface CreditAnalysisResult {
  score: number;
  scoreChange: number;
  utilization: number;
  negativeItems: number;
  totalAccounts: number;
  hardInquiries: number;
  recommendations: Array<{
    id: string;
    title: string;
    description: string;
    impact: number;
    urgency: "critical" | "high" | "medium" | "low";
    category: string;
    humanRequired: boolean;
  }>;
  confidence: number;
  assumptions: string[];
}

export function useCreditAnalysis() {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<CreditAnalysisResult | null>(null);
  const { session } = useAuth();
  const { toast } = useToast();

  const analyze = async () => {
    if (!session?.user?.id) {
      toast({
        title: "Not authenticated",
        description: "Please sign in to analyze your credit",
        variant: "destructive",
      });
      return null;
    }

    setAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-credit", {
        body: { user_id: session.user.id },
      });

      if (error) {
        console.error("Credit analysis error:", error);
        toast({
          title: "Analysis failed",
          description: "Failed to analyze your credit profile",
          variant: "destructive",
        });
        return null;
      }

      if (data?.success && data?.data) {
        setResult(data.data);
        toast({
          title: "Analysis complete",
          description: `Score: ${data.data.score} | ${data.data.recommendations.length} recommendations`,
        });
        return data.data as CreditAnalysisResult;
      }

      return null;
    } catch (err) {
      console.error("Error calling analyze-credit:", err);
      toast({
        title: "Error",
        description: "Failed to connect to credit analysis service",
        variant: "destructive",
      });
      return null;
    } finally {
      setAnalyzing(false);
    }
  };

  return {
    analyze,
    analyzing,
    result,
    clearResult: () => setResult(null),
  };
}
