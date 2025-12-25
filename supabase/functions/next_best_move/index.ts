import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response("Unauthorized", { status: 401 });
    }

    const jwt = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(jwt);

    if (authError || !user) {
      return new Response("Invalid user", { status: 401 });
    }

    const userId = user.id;

    // ─────────────────────────────
    // Fetch user data
    // ─────────────────────────────
    const [
      creditReports,
      tradelines,
      scoreHistory,
      existingActions,
      disputes,
      wealthPlans,
    ] = await Promise.all([
      supabase.from("credit_reports").select("*").eq("user_id", userId),
      supabase.from("tradelines").select("*").eq("user_id", userId),
      supabase
        .from("score_history")
        .select("*")
        .eq("user_id", userId)
        .order("recorded_at", { ascending: false })
        .limit(1),
      supabase
        .from("actions")
        .select("action_type")
        .eq("user_id", userId)
        .in("status", ["pending", "in_progress"]),
      supabase.from("disputes").select("*").eq("user_id", userId),
      supabase.from("wealth_plans").select("*").eq("user_id", userId),
    ]);

    const openActionTypes = new Set(
      existingActions.data?.map((a) => a.action_type)
    );

    const actionsToCreate: any[] = [];

    // ─────────────────────────────
    // RULE 1: No credit report
    // ─────────────────────────────
    if (!creditReports.data?.length && !openActionTypes.has("import_credit_report")) {
      actionsToCreate.push({
        title: "Import your credit report",
        description: "Connect a credit bureau to begin credit analysis.",
        action_type: "import_credit_report",
        priority: "critical",
        estimated_impact: 40,
        human_required: false,
      });
    }

    // ─────────────────────────────
    // RULE 2: High utilization
    // ─────────────────────────────
    const revolving = tradelines.data?.filter(
      (t) => t.credit_limit && t.current_balance
    );

    if (revolving?.length) {
      const totalBalance = revolving.reduce(
        (sum, t) => sum + Number(t.current_balance || 0),
        0
      );
      const totalLimit = revolving.reduce(
        (sum, t) => sum + Number(t.credit_limit || 0),
        0
      );

      const utilization = totalLimit ? totalBalance / totalLimit : 0;

      if (utilization > 0.3 && !openActionTypes.has("reduce_utilization")) {
        actionsToCreate.push({
          title: "Reduce credit utilization",
          description: "Lower balances below 30% to boost your credit score.",
          action_type: "reduce_utilization",
          priority: "high",
          estimated_impact: 30,
          metadata: { utilization },
        });
      }
    }

    // ─────────────────────────────
    // RULE 3: Negative tradelines
    // ─────────────────────────────
    const negativeTradelines = tradelines.data?.filter((t) => t.is_negative);

    if (
      negativeTradelines?.length &&
      !openActionTypes.has("dispute_negative_items")
    ) {
      actionsToCreate.push({
        title: "Dispute negative tradelines",
        description:
          "Challenge inaccurate or outdated negative items on your credit report.",
        action_type: "dispute_negative_items",
        priority: "high",
        estimated_impact: 25,
        human_required: true,
      });
    }

    // ─────────────────────────────
    // RULE 4: No wealth plan
    // ─────────────────────────────
    if (!wealthPlans.data?.length && !openActionTypes.has("create_wealth_plan")) {
      actionsToCreate.push({
        title: "Create your wealth plan",
        description:
          "Define income goals, strategies, and a timeline for wealth building.",
        action_type: "create_wealth_plan",
        priority: "medium",
        estimated_impact: 20,
      });
    }

    // ─────────────────────────────
    // Persist actions (max 3)
    // ─────────────────────────────
    const inserts = actionsToCreate.slice(0, 3).map((action) => ({
      user_id: userId,
      ...action,
    }));

    if (inserts.length) {
      await supabase.from("actions").insert(inserts);
    }

    return new Response(
      JSON.stringify({ created: inserts }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("next_best_move error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
});
