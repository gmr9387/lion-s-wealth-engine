import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AnalysisRequest {
  user_id: string;
}

interface CreditAnalysis {
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { user_id }: AnalysisRequest = await req.json();

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: "user_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch user's tradelines
    const { data: tradelines, error: tradelinesError } = await supabase
      .from("tradelines")
      .select("*")
      .eq("user_id", user_id);

    if (tradelinesError) throw tradelinesError;

    // Fetch latest scores
    const { data: scores, error: scoresError } = await supabase
      .from("score_history")
      .select("*")
      .eq("user_id", user_id)
      .order("recorded_at", { ascending: false })
      .limit(2);

    if (scoresError) throw scoresError;

    // Calculate metrics
    const totalBalance = tradelines?.reduce((sum, t) => sum + (t.current_balance || 0), 0) || 0;
    const totalLimit = tradelines?.reduce((sum, t) => sum + (t.credit_limit || 0), 0) || 0;
    const utilization = totalLimit > 0 ? Math.round((totalBalance / totalLimit) * 100) : 0;
    const negativeItems = tradelines?.filter(t => t.is_negative).length || 0;
    const totalAccounts = tradelines?.length || 0;

    const currentScore = scores?.[0]?.score || 600;
    const previousScore = scores?.[1]?.score || currentScore;
    const scoreChange = currentScore - previousScore;

    // Generate recommendations based on analysis
    const recommendations = [];

    // Utilization recommendation
    if (utilization > 30) {
      const targetBalance = totalLimit * 0.3;
      const paydownAmount = totalBalance - targetBalance;
      const urgency: "critical" | "high" | "medium" | "low" = utilization > 75 ? "critical" : utilization > 50 ? "high" : "medium";
      recommendations.push({
        id: "utilization-1",
        title: "Reduce Credit Utilization",
        description: `Pay down $${Math.round(paydownAmount).toLocaleString()} to reach 30% utilization. Current: ${utilization}%`,
        impact: Math.min(40, Math.round((utilization - 30) / 2)),
        urgency,
        category: "Utilization",
        humanRequired: false,
      });
    }

    // Negative items recommendation
    if (negativeItems > 0) {
      const urgency: "critical" | "high" | "medium" | "low" = negativeItems > 2 ? "critical" : "high";
      recommendations.push({
        id: "negative-1",
        title: "Dispute Negative Items",
        description: `You have ${negativeItems} negative item(s) that may be eligible for dispute or removal.`,
        impact: negativeItems * 15,
        urgency,
        category: "Disputes",
        humanRequired: true,
      });
    }

    // Account age recommendation
    if (totalAccounts < 3) {
      recommendations.push({
        id: "accounts-1",
        title: "Build Credit Mix",
        description: "Consider adding a secured card or credit builder loan to diversify your credit profile.",
        impact: 15,
        urgency: "medium" as const,
        category: "Credit Building",
        humanRequired: true,
      });
    }

    const analysis: CreditAnalysis = {
      score: currentScore,
      scoreChange,
      utilization,
      negativeItems,
      totalAccounts,
      hardInquiries: 0, // Would come from credit report data
      recommendations,
      confidence: 0.85,
      assumptions: [
        "Based on available tradeline data",
        "Score projections assume consistent payment history",
        "Impact estimates are approximations",
      ],
    };

    // Store the analysis action
    await supabase.from("actions").insert({
      user_id,
      action_type: "credit_analysis",
      title: "Credit Analysis Complete",
      description: `Score: ${currentScore} | Utilization: ${utilization}% | ${recommendations.length} recommendations`,
      status: "completed",
      priority: "medium",
      human_required: false,
      metadata: analysis,
    });

    return new Response(
      JSON.stringify({ success: true, data: analysis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
