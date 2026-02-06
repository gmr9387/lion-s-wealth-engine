import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MillionModeRequest {
  user_id: string;
  consent_id: string;
  max_hard_pulls_48h?: number;
}

interface FundingSequenceStep {
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

// Million Mode funding sequence - optimized order for maximum approvals
const FUNDING_SEQUENCE: Omit<FundingSequenceStep, "id">[] = [
  {
    step: 1,
    provider: "Discover",
    product: "Discover It",
    action: "Apply for Discover It card",
    expectedAmount: 5000,
    timing: "Day 1",
    requirements: ["650+ score", "No recent Discover apps"],
    riskLevel: "low",
    humanRequired: true,
  },
  {
    step: 2,
    provider: "Capital One",
    product: "Quicksilver",
    action: "Apply for Capital One Quicksilver",
    expectedAmount: 5000,
    timing: "Day 1 (+2 hrs)",
    requirements: ["650+ score", "Income verification"],
    riskLevel: "low",
    humanRequired: true,
  },
  {
    step: 3,
    provider: "Chase",
    product: "Freedom Unlimited",
    action: "Apply for Chase Freedom Unlimited",
    expectedAmount: 8000,
    timing: "Day 1 (+4 hrs)",
    requirements: ["680+ score", "No 5/24 rule violation"],
    riskLevel: "medium",
    humanRequired: true,
  },
  {
    step: 4,
    provider: "American Express",
    product: "Blue Cash Everyday",
    action: "Apply for Amex Blue Cash",
    expectedAmount: 10000,
    timing: "Day 1 (+6 hrs)",
    requirements: ["680+ score", "Good Amex history"],
    riskLevel: "medium",
    humanRequired: true,
  },
  {
    step: 5,
    provider: "Citi",
    product: "Double Cash",
    action: "Apply for Citi Double Cash",
    expectedAmount: 7500,
    timing: "Day 2",
    requirements: ["680+ score", "6+ months credit history"],
    riskLevel: "medium",
    humanRequired: true,
  },
  {
    step: 6,
    provider: "Bank of America",
    product: "Customized Cash Rewards",
    action: "Apply for BofA Cash Rewards",
    expectedAmount: 6000,
    timing: "Day 2 (+4 hrs)",
    requirements: ["670+ score", "Preferred Rewards eligible"],
    riskLevel: "medium",
    humanRequired: true,
  },
  {
    step: 7,
    provider: "Wells Fargo",
    product: "Active Cash",
    action: "Apply for Wells Fargo Active Cash",
    expectedAmount: 5000,
    timing: "Day 3",
    requirements: ["680+ score", "No recent WF apps"],
    riskLevel: "medium",
    humanRequired: true,
  },
  {
    step: 8,
    provider: "US Bank",
    product: "Cash+",
    action: "Apply for US Bank Cash+",
    expectedAmount: 5000,
    timing: "Day 3 (+4 hrs)",
    requirements: ["700+ score", "Existing US Bank relationship"],
    riskLevel: "medium",
    humanRequired: true,
  },
  {
    step: 9,
    provider: "Navy Federal",
    product: "cashRewards",
    action: "Apply for Navy Federal (if eligible)",
    expectedAmount: 25000,
    timing: "Day 4",
    requirements: ["680+ score", "Military affiliation"],
    riskLevel: "low",
    humanRequired: true,
  },
  {
    step: 10,
    provider: "Chase",
    product: "Sapphire Preferred",
    action: "Apply for Chase Sapphire Preferred",
    expectedAmount: 15000,
    timing: "Day 4 (+4 hrs)",
    requirements: ["720+ score", "No 5/24 rule violation"],
    riskLevel: "high",
    humanRequired: true,
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { 
      user_id, 
      consent_id,
      max_hard_pulls_48h = 6 
    }: MillionModeRequest = await req.json();

    // Validate required fields
    if (!user_id || !consent_id) {
      return new Response(
        JSON.stringify({ error: "user_id and consent_id are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Rate limiting: 5 requests per hour
    const { data: rateLimitOk } = await supabase.rpc("check_rate_limit", {
      p_identifier: user_id,
      p_function_name: "million-mode",
      p_max_requests: 5,
      p_window_seconds: 3600,
    });
    if (!rateLimitOk) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify consent
    const { data: consent, error: consentError } = await supabase
      .from("consents")
      .select("*")
      .eq("id", consent_id)
      .eq("user_id", user_id)
      .eq("consent_type", "million_mode")
      .single();

    if (consentError || !consent) {
      return new Response(
        JSON.stringify({ error: "Valid million_mode consent required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user's current credit profile
    const { data: scores } = await supabase
      .from("score_history")
      .select("*")
      .eq("user_id", user_id)
      .order("recorded_at", { ascending: false })
      .limit(1);

    const currentScore = scores?.[0]?.score || 600;

    // Filter sequence based on score
    const eligibleSteps = FUNDING_SEQUENCE.filter(step => {
      const minScore = parseInt(step.requirements[0]?.match(/\d+/)?.[0] || "600");
      return currentScore >= minScore - 20; // Allow 20 point buffer
    });

    // Calculate totals
    const projectedTotal = eligibleSteps.reduce((sum, s) => sum + s.expectedAmount, 0);
    const warnings: string[] = [];

    if (currentScore < 680) {
      warnings.push("Score below 680 may result in reduced approvals");
    }

    if (eligibleSteps.length < FUNDING_SEQUENCE.length) {
      warnings.push(`${FUNDING_SEQUENCE.length - eligibleSteps.length} steps skipped due to credit requirements`);
    }

    // Determine overall risk level
    const riskLevel = currentScore >= 720 ? "low" : currentScore >= 680 ? "medium" : "high";

    // Create sequence with IDs
    const sequence: FundingSequenceStep[] = eligibleSteps.map((step, index) => ({
      ...step,
      id: `mm-step-${index + 1}`,
    }));

    // Create admin approval request
    const { data: approval } = await supabase.from("admin_approvals").insert({
      requested_by: user_id,
      status: "pending",
      notes: `Million Mode activation - ${eligibleSteps.length} steps, $${projectedTotal.toLocaleString()} projected`,
    }).select().single();

    // Create action record
    await supabase.from("actions").insert({
      user_id,
      action_type: "million_mode_requested",
      title: "Million Mode Activation Requested",
      description: `${eligibleSteps.length} funding applications, $${projectedTotal.toLocaleString()} projected`,
      status: "requires_approval",
      priority: "critical",
      human_required: true,
      metadata: {
        sequence_length: eligibleSteps.length,
        projected_total: projectedTotal,
        risk_level: riskLevel,
        consent_id,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          sequence,
          projectedTotal,
          riskLevel,
          warnings,
          maxHardPulls48h: max_hard_pulls_48h,
          estimatedDuration: `${Math.ceil(eligibleSteps.length / max_hard_pulls_48h) * 2} days`,
          status: "pending_approval",
          approvalId: approval?.id,
          humanRequired: true,
          message: "Million Mode plan created. Requires admin approval before execution.",
        },
        confidence: 0.75,
        assumptions: [
          "Based on current credit profile",
          "Actual approvals may vary",
          "Credit limits are estimates",
          "Multiple hard inquiries will occur",
        ],
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
