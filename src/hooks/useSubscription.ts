import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export const SUBSCRIPTION_TIERS = {
  starter: {
    product_id: "prod_Tt8Pj3d2nRJuhZ",
    price_id: "price_1SvM8FPe1XH7fjJZWI2pXwoQ",
    name: "Starter",
    price: 49,
    features: [
      "Credit restoration tools",
      "Dispute automation",
      "Basic wealth planning",
      "Up to 3 disputes/month",
    ],
  },
  elite: {
    product_id: "prod_Tt8PPfCz0hKenc",
    price_id: "price_1SvM8YPe1XH7fjJZAQGQD8zx",
    name: "Elite",
    price: 99,
    features: [
      "Everything in Starter",
      "Million Mode access",
      "Funding timeline projections",
      "Business automation",
      "Unlimited disputes",
      "Priority support",
    ],
  },
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS | null;

interface SubscriptionState {
  subscribed: boolean;
  tier: SubscriptionTier;
  productId: string | null;
  subscriptionEnd: string | null;
  loading: boolean;
}

export function useSubscription() {
  const [state, setState] = useState<SubscriptionState>({
    subscribed: false,
    tier: null,
    productId: null,
    subscriptionEnd: null,
    loading: true,
  });
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const { session } = useAuth();
  const { toast } = useToast();

  const checkSubscription = useCallback(async () => {
    if (!session?.access_token) {
      setState((prev) => ({ ...prev, loading: false }));
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("check-subscription", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error("Error checking subscription:", error);
        setState((prev) => ({ ...prev, loading: false }));
        return;
      }

      // Determine tier from product ID
      let tier: SubscriptionTier = null;
      if (data?.product_id) {
        if (data.product_id === SUBSCRIPTION_TIERS.starter.product_id) {
          tier = "starter";
        } else if (data.product_id === SUBSCRIPTION_TIERS.elite.product_id) {
          tier = "elite";
        }
      }

      setState({
        subscribed: data?.subscribed || false,
        tier,
        productId: data?.product_id || null,
        subscriptionEnd: data?.subscription_end || null,
        loading: false,
      });
    } catch (err) {
      console.error("Error in checkSubscription:", err);
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [session?.access_token]);

  const createCheckout = async (priceId: string) => {
    if (!session?.access_token) {
      toast({
        title: "Not authenticated",
        description: "Please sign in to subscribe",
        variant: "destructive",
      });
      return;
    }

    setCheckoutLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { price_id: priceId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err) {
      console.error("Error creating checkout:", err);
      toast({
        title: "Error",
        description: "Failed to create checkout session",
        variant: "destructive",
      });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const openCustomerPortal = async () => {
    if (!session?.access_token) {
      toast({
        title: "Not authenticated",
        description: "Please sign in to manage subscription",
        variant: "destructive",
      });
      return;
    }

    setPortalLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("customer-portal", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err) {
      console.error("Error opening portal:", err);
      toast({
        title: "Error",
        description: "Failed to open customer portal",
        variant: "destructive",
      });
    } finally {
      setPortalLoading(false);
    }
  };

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [checkSubscription]);

  return {
    ...state,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
    checkoutLoading,
    portalLoading,
  };
}
