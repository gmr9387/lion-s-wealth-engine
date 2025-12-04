import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DisputeRequest {
  user_id: string;
  tradeline_id?: string;
  bureau: "experian" | "equifax" | "transunion";
  reason: string;
  consent_id: string;
}

// FCRA-compliant dispute letter templates
const DISPUTE_TEMPLATES = {
  not_mine: `Dear {bureau_name},

I am writing to dispute the following information in my file. I have identified an account that does not belong to me and is being incorrectly reported on my credit report.

Account Name: {creditor_name}
Account Number: {account_number}

This account is not mine. I have no knowledge of this account and have never had any relationship with this creditor. I am requesting that this account be investigated and removed from my credit report as it is inaccurate.

Under the Fair Credit Reporting Act, Section 611 (15 U.S.C. § 1681i), you are required to investigate this dispute within 30 days of receipt and remove any information that cannot be verified.

Please investigate this matter and send me written confirmation of your findings.

Sincerely,
{full_name}`,

  inaccurate_balance: `Dear {bureau_name},

I am writing to dispute the following information in my file. The balance being reported for the account listed below is inaccurate.

Account Name: {creditor_name}
Account Number: {account_number}
Reported Balance: {reported_balance}
Actual Balance: {actual_balance}

I have records showing that the correct balance is different from what is being reported. I am requesting that you investigate this discrepancy and update my credit report to reflect the accurate balance.

Under the Fair Credit Reporting Act, Section 611 (15 U.S.C. § 1681i), you are required to investigate this dispute within 30 days of receipt.

Please send me written confirmation once this has been corrected.

Sincerely,
{full_name}`,

  goodwill: `Dear {creditor_name},

I am writing to request a goodwill adjustment regarding a late payment that was reported on my account.

Account Number: {account_number}
Late Payment Date: {late_payment_date}

I have been a loyal customer and this late payment was an isolated incident due to {reason}. Since then, I have maintained a perfect payment history with your company.

I am requesting that you consider removing this late payment from my credit report as a gesture of goodwill. I understand this is at your discretion, but I would greatly appreciate your consideration.

Thank you for your time and for being a valued credit partner.

Sincerely,
{full_name}`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { user_id, tradeline_id, bureau, reason, consent_id }: DisputeRequest = await req.json();

    // Validate required fields
    if (!user_id || !bureau || !reason || !consent_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: user_id, bureau, reason, consent_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify consent exists and is valid
    const { data: consent, error: consentError } = await supabase
      .from("consents")
      .select("*")
      .eq("id", consent_id)
      .eq("user_id", user_id)
      .single();

    if (consentError || !consent) {
      return new Response(
        JSON.stringify({ error: "Invalid or missing consent" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user_id)
      .single();

    // Get tradeline info if provided
    let tradeline = null;
    if (tradeline_id) {
      const { data } = await supabase
        .from("tradelines")
        .select("*")
        .eq("id", tradeline_id)
        .single();
      tradeline = data;
    }

    // Determine template based on reason
    const templateKey = reason.includes("not mine") ? "not_mine" 
      : reason.includes("balance") ? "inaccurate_balance"
      : "goodwill";

    const bureauNames = {
      experian: "Experian",
      equifax: "Equifax",
      transunion: "TransUnion",
    };

    // Generate dispute letter
    let letterContent = DISPUTE_TEMPLATES[templateKey] || DISPUTE_TEMPLATES.not_mine;
    letterContent = letterContent
      .replace("{bureau_name}", bureauNames[bureau])
      .replace("{full_name}", profile?.full_name || "Account Holder")
      .replace("{creditor_name}", tradeline?.creditor_name || "[Creditor Name]")
      .replace("{account_number}", tradeline?.account_number_masked || "[Account Number]")
      .replace("{reported_balance}", tradeline?.current_balance?.toString() || "[Amount]")
      .replace("{actual_balance}", "[Correct Amount]")
      .replace("{late_payment_date}", "[Date]")
      .replace("{reason}", reason);

    // Create dispute record
    const { data: dispute, error: disputeError } = await supabase
      .from("disputes")
      .insert({
        user_id,
        bureau,
        tradeline_id,
        reason,
        letter_content: letterContent,
        consent_id,
        status: "pending_review",
        human_required: true, // Always requires human review
      })
      .select()
      .single();

    if (disputeError) throw disputeError;

    // Create admin approval request
    await supabase.from("admin_approvals").insert({
      dispute_id: dispute.id,
      requested_by: user_id,
      status: "pending",
      notes: `Dispute for ${bureauNames[bureau]} - ${reason}`,
    });

    // Create action record
    await supabase.from("actions").insert({
      user_id,
      action_type: "dispute_created",
      title: `Dispute Created - ${bureauNames[bureau]}`,
      description: reason,
      status: "requires_approval",
      priority: "high",
      human_required: true,
      metadata: { dispute_id: dispute.id },
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          dispute_id: dispute.id,
          status: "pending_review",
          letter_preview: letterContent.substring(0, 500) + "...",
          human_required: true,
          message: "Dispute created and pending admin review",
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
