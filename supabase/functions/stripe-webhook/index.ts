import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

const sendNotification = async (type: string, userId: string, data?: Record<string, unknown>) => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      logStep("Missing Supabase config for notifications");
      return;
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/send-notification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ type, userId, data }),
    });

    if (response.ok) {
      logStep("Notification sent", { type, userId });
    } else {
      const error = await response.text();
      logStep("Notification failed", { type, error });
    }
  } catch (error) {
    logStep("Notification error", { error: String(error) });
  }
};

/**
 * Resolve user_id from Stripe customer via metadata, then fallback to email lookup.
 */
const getUserIdFromCustomer = async (
  stripe: Stripe,
  customerId: string,
  supabaseClient: ReturnType<typeof createClient>
): Promise<string | null> => {
  try {
    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) return null;

    const stripeCustomer = customer as Stripe.Customer;

    // Primary: use metadata user_id
    if (stripeCustomer.metadata?.user_id) {
      logStep("Resolved user_id from customer metadata", { userId: stripeCustomer.metadata.user_id });
      return stripeCustomer.metadata.user_id;
    }

    // Fallback: lookup by email in profiles table
    if (stripeCustomer.email) {
      const { data: profile } = await supabaseClient
        .from("profiles")
        .select("user_id")
        .eq("email", stripeCustomer.email)
        .maybeSingle();

      if (profile?.user_id) {
        logStep("Resolved user_id via email fallback", { email: stripeCustomer.email, userId: profile.user_id });

        // Backfill metadata for future calls
        await stripe.customers.update(customerId, {
          metadata: { ...stripeCustomer.metadata, user_id: profile.user_id },
        });
        return profile.user_id;
      }
    }

    logStep("Could not resolve user_id for customer", { customerId });
    return null;
  } catch (err) {
    logStep("Error resolving user_id", { error: String(err) });
    return null;
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!stripeKey || !webhookSecret) {
      throw new Error("Missing Stripe configuration");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      throw new Error("No Stripe signature found");
    }

    const body = await req.text();
    let event: Stripe.Event;

    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logStep("Webhook signature verification failed", { error: message });
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    logStep("Event verified", { type: event.type, id: event.id });

    // Initialize Supabase client for user lookups and idempotency
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    switch (event.type) {
      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = await getUserIdFromCustomer(stripe, subscription.customer as string, supabaseClient);

        logStep("Subscription created", {
          subscriptionId: subscription.id,
          customerId: subscription.customer,
          status: subscription.status,
          userId,
        });

        if (userId) {
          const planName = subscription.items.data[0]?.price?.nickname || "Lion's Wealth Engine Premium";
          await sendNotification("subscription_confirmation", userId, { planName });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Subscription updated", {
          subscriptionId: subscription.id,
          customerId: subscription.customer,
          status: subscription.status,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = await getUserIdFromCustomer(stripe, subscription.customer as string, supabaseClient);

        logStep("Subscription canceled/deleted", {
          subscriptionId: subscription.id,
          customerId: subscription.customer,
          userId,
        });

        if (userId) {
          await sendNotification("subscription_cancelled", userId, {});
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Payment succeeded", {
          invoiceId: invoice.id,
          customerId: invoice.customer,
          amountPaid: invoice.amount_paid,
          subscriptionId: invoice.subscription,
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const userId = await getUserIdFromCustomer(stripe, invoice.customer as string, supabaseClient);

        logStep("Payment failed", {
          invoiceId: invoice.id,
          customerId: invoice.customer,
          attemptCount: invoice.attempt_count,
          nextAttempt: invoice.next_payment_attempt,
          userId,
        });

        if (userId) {
          await sendNotification("action_reminder", userId, {
            actionTitle: "Payment Failed",
            actionDescription: `Your payment attempt failed. Please update your payment method to continue your Lion's Wealth Engine subscription.`,
          });
        }
        break;
      }

      case "customer.subscription.trial_will_end": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = await getUserIdFromCustomer(stripe, subscription.customer as string, supabaseClient);

        logStep("Trial ending soon", {
          subscriptionId: subscription.id,
          customerId: subscription.customer,
          trialEnd: subscription.trial_end,
          userId,
        });

        if (userId) {
          const trialEndDate = subscription.trial_end
            ? new Date(subscription.trial_end * 1000).toLocaleDateString()
            : "soon";
          await sendNotification("action_reminder", userId, {
            actionTitle: "Trial Ending Soon",
            actionDescription: `Your trial ends on ${trialEndDate}. Subscribe now to keep your access.`,
            dueDate: trialEndDate,
          });
        }
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message });
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
