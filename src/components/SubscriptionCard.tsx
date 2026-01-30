import { Check, Crown, Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SUBSCRIPTION_TIERS, SubscriptionTier } from "@/hooks/useSubscription";

interface SubscriptionCardProps {
  tierKey: "starter" | "elite";
  currentTier: SubscriptionTier;
  onSubscribe: (priceId: string) => void;
  loading: boolean;
}

export function SubscriptionCard({
  tierKey,
  currentTier,
  onSubscribe,
  loading,
}: SubscriptionCardProps) {
  const tier = SUBSCRIPTION_TIERS[tierKey];
  const isCurrentPlan = currentTier === tierKey;
  const isElite = tierKey === "elite";

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        isElite && "border-primary shadow-lg shadow-primary/20",
        isCurrentPlan && "ring-2 ring-success"
      )}
    >
      {isElite && (
        <div className="absolute top-0 right-0 bg-gradient-gold px-3 py-1 text-xs font-semibold text-primary-foreground rounded-bl-lg">
          Most Popular
        </div>
      )}

      {isCurrentPlan && (
        <Badge className="absolute top-3 left-3 bg-success text-success-foreground">
          Your Plan
        </Badge>
      )}

      <CardHeader className={cn("pt-8", isCurrentPlan && "pt-12")}>
        <div className="flex items-center gap-2 mb-2">
          {isElite ? (
            <Crown className="w-6 h-6 text-primary" />
          ) : (
            <Zap className="w-6 h-6 text-accent" />
          )}
          <CardTitle className="text-xl">{tier.name}</CardTitle>
        </div>
        <CardDescription>
          <span className="text-3xl font-bold text-foreground">${tier.price}</span>
          <span className="text-muted-foreground">/month</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <ul className="space-y-3">
          {tier.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <Check className="w-4 h-4 text-success mt-0.5 shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <Button
          variant={isElite ? "glow" : "outline"}
          className="w-full"
          onClick={() => onSubscribe(tier.price_id)}
          disabled={loading || isCurrentPlan}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : isCurrentPlan ? (
            "Current Plan"
          ) : (
            `Subscribe to ${tier.name}`
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
