import { useEffect } from "react";
import { FundingProbabilityCard } from "@/components/FundingProbabilityCard";
import { useFundingTimeline } from "@/hooks/useFundingTimeline";
import { useAuth } from "@/hooks/useAuth";

const fallbackTargets = [
  { amount: 10000, probability: 85, confidence: "high" as const, date: "90 days", requirements: ["Score 620+", "3 months history"] },
  { amount: 25000, probability: 65, confidence: "medium" as const, date: "6 months", requirements: ["Score 680+", "Income verification"] },
  { amount: 100000, probability: 40, confidence: "low" as const, date: "12 months", requirements: ["Score 720+", "Business entity", "Tax returns"] },
];

export function DashboardFunding() {
  const { session } = useAuth();
  const { calculateProjections, loading, result } = useFundingTimeline();

  useEffect(() => {
    if (session?.user && !result && !loading) {
      calculateProjections();
    }
  }, [session?.user]);

  const targets = result?.projections?.slice(0, 3).map((p) => ({
    amount: p.target,
    probability: p.probability,
    confidence: p.confidence,
    date: p.targetMonth,
    requirements: p.requirements,
  })) || fallbackTargets;

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground mb-4">Funding Timeline</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {targets.map((target, i) => (
          <FundingProbabilityCard
            key={i}
            targetAmount={target.amount}
            probability={target.probability}
            targetDate={target.date}
            requirements={target.requirements}
            confidence={target.confidence}
          />
        ))}
      </div>
    </div>
  );
}
