import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { CreditCard, Loader2, RefreshCw, ExternalLink } from "lucide-react";
import { SubscriptionCard } from "@/components/SubscriptionCard";
import { useSubscription, SUBSCRIPTION_TIERS } from "@/hooks/useSubscription";
import { useSearchParams } from "react-router-dom";

export function SubscriptionSection() {
  const [searchParams] = useSearchParams();
  const {
    subscribed,
    tier,
    subscriptionEnd,
    loading: subscriptionLoading,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
    checkoutLoading,
    portalLoading,
  } = useSubscription();

  useEffect(() => {
    const subscriptionStatus = searchParams.get("subscription");
    if (subscriptionStatus === "success") {
      toast({
        title: "Subscription successful!",
        description: "Welcome to Lion's Wealth Engine! Your subscription is now active.",
      });
      checkSubscription();
    } else if (subscriptionStatus === "canceled") {
      toast({
        title: "Checkout canceled",
        description: "You can subscribe anytime from Settings.",
      });
    }
  }, [searchParams]);

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <CreditCard className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Subscription</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={checkSubscription}
          disabled={subscriptionLoading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${subscriptionLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {subscribed && tier && (
        <div className="mb-6 p-4 rounded-lg bg-success/10 border border-success/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current Plan</p>
              <p className="text-xl font-bold text-gradient-gold">
                {SUBSCRIPTION_TIERS[tier].name}
              </p>
              {subscriptionEnd && (
                <p className="text-xs text-muted-foreground mt-1">
                  Renews {new Date(subscriptionEnd).toLocaleDateString()}
                </p>
              )}
            </div>
            <Button variant="outline" onClick={openCustomerPortal} disabled={portalLoading}>
              {portalLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ExternalLink className="w-4 h-4 mr-2" />
              )}
              Manage
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        <SubscriptionCard
          tierKey="starter"
          currentTier={tier}
          onSubscribe={createCheckout}
          loading={checkoutLoading}
        />
        <SubscriptionCard
          tierKey="elite"
          currentTier={tier}
          onSubscribe={createCheckout}
          loading={checkoutLoading}
        />
      </div>
    </div>
  );
}
