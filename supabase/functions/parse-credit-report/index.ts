import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Tradeline {
  creditor_name: string;
  account_type: string | null;
  account_number_masked: string | null;
  current_balance: number | null;
  credit_limit: number | null;
  payment_status: string | null;
  date_opened: string | null;
  is_negative: boolean;
}

interface ParsedReport {
  score: number | null;
  bureau: string | null;
  tradelines: Tradeline[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

    // Validate auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);

    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log("Parsing credit report for user:", userId);

    const { uploadId, reportText } = await req.json();

    if (!uploadId || !reportText) {
      return new Response(
        JSON.stringify({ error: "Missing uploadId or reportText" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // Rate limiting: 5 requests per hour
    const { data: rateLimitOk } = await supabase.rpc("check_rate_limit", {
      p_identifier: userId,
      p_function_name: "parse-credit-report",
      p_max_requests: 5,
      p_window_seconds: 3600,
    });
    if (!rateLimitOk) {
      console.log("Rate limit exceeded for user:", userId);
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update upload status to processing
    await supabase
      .from("credit_report_uploads")
      .update({ status: "processing" })
      .eq("id", uploadId);

    console.log("Calling Lovable AI to parse credit report...");

    // Use Lovable AI to parse the credit report
    const aiResponse = await fetch("https://api.lovable.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a credit report parser. Extract structured data from credit reports.
            
Return a JSON object with this exact structure:
{
  "score": <number or null>,
  "bureau": "<experian|equifax|transunion or null>",
  "tradelines": [
    {
      "creditor_name": "<string>",
      "account_type": "<credit_card|auto_loan|mortgage|student_loan|personal_loan|retail|collection|other or null>",
      "account_number_masked": "<last 4 digits like ****1234 or null>",
      "current_balance": <number or null>,
      "credit_limit": <number or null>,
      "payment_status": "<current|30_days_late|60_days_late|90_days_late|120_days_late|charge_off|collection|closed or null>",
      "date_opened": "<YYYY-MM-DD or null>",
      "is_negative": <boolean - true if late payments, collections, charge-offs>
    }
  ]
}

IMPORTANT:
- Extract ALL tradelines/accounts you can find
- Identify negative items (late payments, collections, charge-offs, bankruptcies)
- Detect the credit bureau from the report formatting/branding
- Return ONLY valid JSON, no markdown or explanations`
          },
          {
            role: "user",
            content: `Parse this credit report and extract all tradelines:\n\n${reportText.substring(0, 30000)}`
          }
        ],
        temperature: 0.1,
        max_tokens: 4000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", errorText);
      throw new Error(`AI parsing failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "";
    
    console.log("AI response received, parsing JSON...");

    // Extract JSON from response
    let parsed: ParsedReport;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }
      parsed = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      await supabase
        .from("credit_report_uploads")
        .update({ 
          status: "failed", 
          error_message: "Failed to parse AI response",
          processed_at: new Date().toISOString()
        })
        .eq("id", uploadId);
      
      return new Response(
        JSON.stringify({ error: "Failed to parse credit report" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Parsed ${parsed.tradelines?.length || 0} tradelines, score: ${parsed.score}`);

    // Insert tradelines into database
    const tradelinesToInsert = (parsed.tradelines || []).map((t: Tradeline) => ({
      user_id: userId,
      creditor_name: t.creditor_name,
      account_type: t.account_type,
      account_number_masked: t.account_number_masked,
      current_balance: t.current_balance,
      credit_limit: t.credit_limit,
      payment_status: t.payment_status,
      date_opened: t.date_opened,
      is_negative: t.is_negative || false,
      bureau: parsed.bureau as "experian" | "equifax" | "transunion" | null,
    }));

    if (tradelinesToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from("tradelines")
        .insert(tradelinesToInsert);

      if (insertError) {
        console.error("Error inserting tradelines:", insertError);
      }
    }

    // Record score in history if found
    if (parsed.score && parsed.bureau) {
      await supabase.from("score_history").insert({
        user_id: userId,
        score: parsed.score,
        bureau: parsed.bureau,
        source: "pdf_import",
      });
    }

    // Update upload status to completed
    await supabase
      .from("credit_report_uploads")
      .update({
        status: "completed",
        extracted_score: parsed.score,
        tradelines_count: tradelinesToInsert.length,
        bureau: parsed.bureau,
        processed_at: new Date().toISOString(),
      })
      .eq("id", uploadId);

    return new Response(
      JSON.stringify({
        success: true,
        score: parsed.score,
        bureau: parsed.bureau,
        tradelinesExtracted: tradelinesToInsert.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("parse-credit-report error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal Server Error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
