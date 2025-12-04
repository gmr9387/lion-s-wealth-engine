import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TimelineRequest {
  user_id: string;
  targets?: number[];
}

interface FundingProjection {
  target: number;
  targetMonth: string;
  probability: number;
  requirements: string[];
  confidence: "high" | "medium" | "low";
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

    const { user_id, targets = [10000, 25000, 50000, 100000, 250000, 500000, 1000000] }: TimelineRequest = await req.json();

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: "user_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch user's current credit data
    const { data: scores } = await supabase
      .from("score_history")
      .select("*")
      .eq("user_id", user_id)
      .order("recorded_at", { ascending: false })
      .limit(1);

    const { data: tradelines } = await supabase
      .from("tradelines")
      .select("*")
      .eq("user_id", user_id);

    const currentScore = scores?.[0]?.score || 580;
    const totalAccounts = tradelines?.length || 0;
    const negativeItems = tradelines?.filter(t => t.is_negative).length || 0;
    const totalLimit = tradelines?.reduce((sum, t) => sum + (t.credit_limit || 0), 0) || 0;
    const totalBalance = tradelines?.reduce((sum, t) => sum + (t.current_balance || 0), 0) || 0;
    const utilization = totalLimit > 0 ? Math.round((totalBalance / totalLimit) * 100) : 50;

    // Calculate projections for each target
    const projections: FundingProjection[] = targets.map(target => {
      let monthsNeeded = 0;
      let probability = 0;
      const requirements: string[] = [];
      const assumptions: string[] = [];

      // Score requirements by funding amount
      const scoreNeeded = target >= 500000 ? 750 :
                          target >= 250000 ? 720 :
                          target >= 100000 ? 700 :
                          target >= 50000 ? 680 :
                          target >= 25000 ? 650 :
                          620;

      const scoreDiff = scoreNeeded - currentScore;
      
      // Estimate months needed based on score improvement rate
      // Average improvement: 10-20 points/month with active management
      const avgPointsPerMonth = 15;
      if (scoreDiff > 0) {
        monthsNeeded = Math.ceil(scoreDiff / avgPointsPerMonth);
        requirements.push(`Achieve ${scoreNeeded}+ credit score`);
        assumptions.push(`Score improvement of ~${avgPointsPerMonth} pts/month`);
      }

      // Utilization requirements
      if (utilization > 30) {
        requirements.push("Reduce utilization below 30%");
        monthsNeeded = Math.max(monthsNeeded, 2);
      }

      // Account age requirements
      if (target >= 50000 && totalAccounts < 3) {
        requirements.push("Establish 3+ tradelines");
        monthsNeeded = Math.max(monthsNeeded, 6);
      }

      // Business requirements for high amounts
      if (target >= 100000) {
        requirements.push("Business entity (LLC/Corp)");
        requirements.push("Business bank account");
        monthsNeeded = Math.max(monthsNeeded, 6);
      }

      if (target >= 250000) {
        requirements.push("Tax returns (2 years)");
        requirements.push("Revenue documentation");
        monthsNeeded = Math.max(monthsNeeded, 12);
      }

      if (target >= 500000) {
        requirements.push("Audited financials");
        requirements.push("Collateral or guarantor");
        monthsNeeded = Math.max(monthsNeeded, 18);
      }

      // Calculate probability
      if (currentScore >= scoreNeeded) {
        probability = 85 - (target / 50000);
      } else if (scoreDiff <= 50) {
        probability = 65 - (target / 50000);
      } else if (scoreDiff <= 100) {
        probability = 45 - (target / 50000);
      } else {
        probability = 25 - (target / 100000);
      }

      // Adjust for negative items
      probability -= negativeItems * 10;

      // Clamp probability
      probability = Math.max(5, Math.min(95, Math.round(probability)));

      // Determine confidence
      const confidence = probability >= 60 ? "high" : probability >= 35 ? "medium" : "low";

      // Calculate target month
      const targetDate = new Date();
      targetDate.setMonth(targetDate.getMonth() + Math.max(monthsNeeded, 3));
      const targetMonth = targetDate.toLocaleDateString("en-US", { month: "short", year: "numeric" });

      assumptions.push(
        "Assumes consistent positive payment history",
        "Based on current credit profile",
        "Market conditions may vary"
      );

      return {
        target,
        targetMonth,
        probability,
        requirements,
        confidence,
        assumptions,
      };
    });

    // Store projections in database
    for (const projection of projections) {
      await supabase.from("funding_projections").upsert({
        user_id,
        target_amount: projection.target,
        target_date: new Date(projection.targetMonth).toISOString(),
        probability_pct: projection.probability,
        confidence: projection.confidence,
        requirements: projection.requirements,
        assumptions: projection.assumptions,
      }, {
        onConflict: "user_id,target_amount",
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          projections,
          currentProfile: {
            score: currentScore,
            utilization,
            totalAccounts,
            negativeItems,
          },
          generatedAt: new Date().toISOString(),
        },
      }),
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
