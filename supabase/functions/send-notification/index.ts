import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type NotificationType =
  | "dispute_status_update"
  | "subscription_confirmation"
  | "subscription_cancelled"
  | "action_reminder"
  | "welcome";

interface NotificationRequest {
  type: NotificationType;
  userId: string;
  data?: Record<string, unknown>;
}

// Resolve the application base URL dynamically
const getAppBaseUrl = (): string => {
  return Deno.env.get("APP_BASE_URL") || Deno.env.get("SITE_URL") || "https://lionswealthengine.com";
};

const BRAND_NAME = "Lion's Wealth Engine";

const getEmailContent = (type: NotificationType, data?: Record<string, unknown>) => {
  const appUrl = getAppBaseUrl();

  const baseStyle = `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
    background-color: #0d1117;
    color: #e6edf3;
  `;

  const buttonStyle = `
    display: inline-block;
    padding: 12px 24px;
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    color: #0d1117;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 600;
  `;

  const cardStyle = `
    background-color: #161b22;
    border: 1px solid #30363d;
    border-radius: 12px;
    padding: 24px;
    margin: 20px 0;
  `;

  const footerStyle = `
    margin-top: 40px;
    padding-top: 20px;
    border-top: 1px solid #30363d;
    font-size: 12px;
    color: #8b949e;
    text-align: center;
  `;

  const footer = `
    <div style="${footerStyle}">
      <p>© ${new Date().getFullYear()} ${BRAND_NAME}. All rights reserved.</p>
      <p>You're receiving this email because you have an account with ${BRAND_NAME}.</p>
    </div>
  `;

  switch (type) {
    case "dispute_status_update":
      return {
        subject: `Dispute Update: ${data?.status || "Status Changed"}`,
        html: `
          <div style="${baseStyle}">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <h1 style="color: #f59e0b; margin-bottom: 24px;">Dispute Status Update</h1>
              <div style="${cardStyle}">
                <p style="margin: 0 0 16px 0;">Your dispute for <strong>${data?.creditorName || "Unknown"}</strong> has been updated.</p>
                <p style="margin: 0 0 16px 0;">
                  <span style="color: #8b949e;">New Status:</span>
                  <span style="color: #f59e0b; font-weight: 600; margin-left: 8px;">${data?.status || "Updated"}</span>
                </p>
                ${data?.notes ? `<p style="color: #8b949e; margin: 0;">Notes: ${data.notes}</p>` : ""}
              </div>
              <a href="${appUrl}/app/disputes" style="${buttonStyle}">View Dispute</a>
              ${footer}
            </div>
          </div>
        `,
      };

    case "subscription_confirmation":
      return {
        subject: `Welcome to ${BRAND_NAME} Premium!`,
        html: `
          <div style="${baseStyle}">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <h1 style="color: #f59e0b; margin-bottom: 24px;">🎉 Subscription Confirmed!</h1>
              <div style="${cardStyle}">
                <p style="margin: 0 0 16px 0;">Thank you for subscribing to <strong style="color: #f59e0b;">${data?.planName || `${BRAND_NAME} Premium`}</strong>!</p>
                <p style="margin: 0 0 16px 0;">You now have full access to:</p>
                <ul style="color: #8b949e; padding-left: 20px;">
                  <li>AI-Powered Credit Analysis</li>
                  <li>Automated Dispute Generation</li>
                  <li>Wealth Building Strategies</li>
                  <li>Million Mode Funding Sequences</li>
                </ul>
              </div>
              <a href="${appUrl}/app" style="${buttonStyle}">Go to Dashboard</a>
              ${footer}
            </div>
          </div>
        `,
      };

    case "subscription_cancelled":
      return {
        subject: `Your ${BRAND_NAME} Subscription Has Been Cancelled`,
        html: `
          <div style="${baseStyle}">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <h1 style="color: #f59e0b; margin-bottom: 24px;">Subscription Cancelled</h1>
              <div style="${cardStyle}">
                <p style="margin: 0 0 16px 0;">Your ${BRAND_NAME} subscription has been cancelled.</p>
                <p style="margin: 0 0 16px 0; color: #8b949e;">You'll continue to have access until the end of your billing period.</p>
                <p style="margin: 0;">We'd love to have you back anytime!</p>
              </div>
              <a href="${appUrl}/app/settings" style="${buttonStyle}">Resubscribe</a>
              ${footer}
            </div>
          </div>
        `,
      };

    case "action_reminder":
      return {
        subject: `Action Required: ${data?.actionTitle || "Pending Task"}`,
        html: `
          <div style="${baseStyle}">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <h1 style="color: #f59e0b; margin-bottom: 24px;">⚡ Action Required</h1>
              <div style="${cardStyle}">
                <h2 style="color: #e6edf3; margin: 0 0 12px 0;">${data?.actionTitle || "Pending Action"}</h2>
                <p style="margin: 0 0 16px 0; color: #8b949e;">${data?.actionDescription || `You have a pending action in your ${BRAND_NAME} dashboard.`}</p>
                ${data?.dueDate ? `<p style="margin: 0; color: #f59e0b;">Due: ${data.dueDate}</p>` : ""}
              </div>
              <a href="${appUrl}/app" style="${buttonStyle}">Take Action</a>
              ${footer}
            </div>
          </div>
        `,
      };

    case "welcome":
      return {
        subject: `Welcome to ${BRAND_NAME} — Your Credit & Wealth Journey Starts Now!`,
        html: `
          <div style="${baseStyle}">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <h1 style="color: #f59e0b; margin-bottom: 24px;">🦁 Welcome to ${BRAND_NAME}!</h1>
              <div style="${cardStyle}">
                <p style="margin: 0 0 16px 0;">You've just taken the first step toward transforming your financial future.</p>
                <p style="margin: 0 0 16px 0; color: #8b949e;">Here's what you can do next:</p>
                <ol style="color: #8b949e; padding-left: 20px;">
                  <li style="margin-bottom: 8px;">Add your current credit score</li>
                  <li style="margin-bottom: 8px;">Upload a credit report for AI analysis</li>
                  <li style="margin-bottom: 8px;">Generate your first dispute letter</li>
                  <li>Explore your personalized wealth plan</li>
                </ol>
              </div>
              <a href="${appUrl}/app" style="${buttonStyle}">Get Started</a>
              ${footer}
            </div>
          </div>
        `,
      };

    default:
      return {
        subject: `${BRAND_NAME} Notification`,
        html: `
          <div style="${baseStyle}">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <p>You have a new notification from ${BRAND_NAME}.</p>
              <a href="${appUrl}/app" style="${buttonStyle}">View Dashboard</a>
              ${footer}
            </div>
          </div>
        `,
      };
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured");
      throw new Error("Email service not configured");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { type, userId, data }: NotificationRequest = await req.json();

    if (!type || !userId) {
      throw new Error("Missing required fields: type and userId");
    }

    console.log(`[SEND-NOTIFICATION] Sending ${type} notification to user ${userId}`);

    // Rate limiting: 50 requests per hour
    const { data: rateLimitOk } = await supabaseClient.rpc("check_rate_limit", {
      p_identifier: userId,
      p_function_name: "send-notification",
      p_max_requests: 50,
      p_window_seconds: 3600,
    });
    if (!rateLimitOk) {
      console.log("[SEND-NOTIFICATION] Rate limit exceeded for user:", userId);
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded" }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get user email from profiles
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("email, full_name")
      .eq("user_id", userId)
      .single();

    if (profileError || !profile?.email) {
      console.error("[SEND-NOTIFICATION] Failed to get user profile:", profileError);
      throw new Error("User profile not found or missing email");
    }

    const { subject, html } = getEmailContent(type, {
      ...data,
      userName: profile.full_name,
    });

    const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || `${BRAND_NAME} <onboarding@resend.dev>`;

    // Send via Resend API
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [profile.email],
        subject,
        html,
      }),
    });

    const emailResult = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("[SEND-NOTIFICATION] Resend API error:", emailResult);
      throw new Error(emailResult.message || "Failed to send email");
    }

    console.log("[SEND-NOTIFICATION] Email sent successfully:", emailResult);

    return new Response(JSON.stringify({ success: true, emailResult }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[SEND-NOTIFICATION] Error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
