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
      p_function_name: "plaid-exchange-token",
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

    const { public_token, institution } = await req.json();

    if (!public_token) {
      return new Response(JSON.stringify({ error: "public_token is required" }), {
        status: 400,
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

    const plaidEnv = Deno.env.get("PLAID_ENV") || "sandbox";
    const plaidBaseUrl =
      plaidEnv === "production"
        ? "https://production.plaid.com"
        : plaidEnv === "development"
        ? "https://development.plaid.com"
        : "https://sandbox.plaid.com";

    console.log(`Exchanging public token for user ${user.id}`);

    // Step 1: Exchange public_token for access_token
    const exchangeRes = await fetch(`${plaidBaseUrl}/item/public_token/exchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: PLAID_CLIENT_ID,
        secret: PLAID_SECRET,
        public_token,
      }),
    });

    const exchangeData = await exchangeRes.json();

    if (!exchangeRes.ok) {
      console.error("Plaid exchange error:", JSON.stringify(exchangeData));
      return new Response(
        JSON.stringify({ error: exchangeData.error_message || "Token exchange failed" }),
        {
          status: exchangeRes.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { access_token, item_id } = exchangeData;
    console.log(`Token exchanged successfully, item_id: ${item_id}`);

    // Step 2: Fetch Auth data (account + routing numbers)
    const authRes = await fetch(`${plaidBaseUrl}/auth/get`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: PLAID_CLIENT_ID,
        secret: PLAID_SECRET,
        access_token,
      }),
    });

    const authData = await authRes.json();
    if (!authRes.ok) {
      console.error("Plaid auth/get error:", JSON.stringify(authData));
    }

    // Step 3: Fetch Identity data (owner name, email, etc.)
    const identityRes = await fetch(`${plaidBaseUrl}/identity/get`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: PLAID_CLIENT_ID,
        secret: PLAID_SECRET,
        access_token,
      }),
    });

    const identityData = await identityRes.json();
    if (!identityRes.ok) {
      console.error("Plaid identity/get error:", JSON.stringify(identityData));
    }

    // Step 4: Store connection(s) in database using service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const accounts = authData.accounts || [];
    const identityAccounts = identityData.accounts || [];

    const connections = accounts.map((account: any) => {
      // Match identity data for this account
      const identityAccount = identityAccounts.find(
        (ia: any) => ia.account_id === account.account_id
      );
      const owners = identityAccount?.owners || [];
      const primaryOwner = owners[0] || {};
      const primaryEmail = primaryOwner.emails?.find((e: any) => e.primary)?.data ||
                           primaryOwner.emails?.[0]?.data || null;

      return {
        user_id: user.id,
        institution_name: institution?.name || null,
        institution_id: institution?.institution_id || null,
        access_token,
        item_id,
        account_id: account.account_id,
        account_name: account.name || account.official_name,
        account_type: account.type,
        account_subtype: account.subtype,
        account_mask: account.mask,
        owner_name: primaryOwner.names?.[0] || null,
        owner_email: primaryEmail,
        status: "active",
      };
    });

    if (connections.length > 0) {
      const { error: insertError } = await supabaseAdmin
        .from("plaid_connections")
        .insert(connections);

      if (insertError) {
        console.error("DB insert error:", insertError.message);
        return new Response(JSON.stringify({ error: "Failed to save connection" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    console.log(`Saved ${connections.length} account(s) for user ${user.id}`);

    // Return sanitized account info (no access_token)
    const sanitizedAccounts = connections.map((c: any) => ({
      account_id: c.account_id,
      account_name: c.account_name,
      account_type: c.account_type,
      account_subtype: c.account_subtype,
      account_mask: c.account_mask,
      institution_name: c.institution_name,
      owner_name: c.owner_name,
      owner_email: c.owner_email,
    }));

    return new Response(
      JSON.stringify({
        success: true,
        accounts: sanitizedAccounts,
        accounts_linked: connections.length,
      }),
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
