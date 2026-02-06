import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Auth check
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Auth error:", authError?.message);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Rate limit
    const { data: allowed } = await supabase.rpc("check_rate_limit", {
      p_identifier: user.id,
      p_function_name: "plaid-link-token",
      p_max_requests: 10,
      p_window_seconds: 3600,
    });

    if (!allowed) {
      console.warn(`Rate limit hit for user ${user.id}`);
      return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const PLAID_CLIENT_ID = Deno.env.get("PLAID_CLIENT_ID");
    const PLAID_SECRET = Deno.env.get("PLAID_SECRET");

    if (!PLAID_CLIENT_ID || !PLAID_SECRET) {
      console.error("Missing Plaid credentials");
      return new Response(JSON.stringify({ error: "Server configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Determine environment — use sandbox for dev, production for live
    const plaidEnv = Deno.env.get("PLAID_ENV") || "sandbox";
    const plaidBaseUrl =
      plaidEnv === "production"
        ? "https://production.plaid.com"
        : plaidEnv === "development"
        ? "https://development.plaid.com"
        : "https://sandbox.plaid.com";

    console.log(`Creating link token for user ${user.id} in ${plaidEnv} environment`);

    const response = await fetch(`${plaidBaseUrl}/link/token/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: PLAID_CLIENT_ID,
        secret: PLAID_SECRET,
        user: { client_user_id: user.id },
        client_name: "Lion's Wealth Engine",
        products: ["auth", "identity"],
        country_codes: ["US"],
        language: "en",
      }),
    });

    const plaidData = await response.json();

    if (!response.ok) {
      console.error("Plaid API error:", JSON.stringify(plaidData));
      return new Response(
        JSON.stringify({ error: plaidData.error_message || "Failed to create link token" }),
        {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Link token created successfully for user ${user.id}`);

    return new Response(
      JSON.stringify({ link_token: plaidData.link_token, expiration: plaidData.expiration }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
