import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/StatCard";
import { 
  TrendingUp, 
  DollarSign, 
  Target,
  Briefcase,
  PiggyBank,
  Loader2
} from "lucide-react";
import { useActiveWealthPlan, useCreateWealthPlan, useUpdateWealthPlan } from "@/hooks/useWealth";
import { WealthPhases } from "@/components/wealth/WealthPhases";
import { DailyActions } from "@/components/wealth/DailyActions";
import { IncomeStreams } from "@/components/wealth/IncomeStreams";
import { UpdateGoalsDialog, WealthGoals } from "@/components/wealth/UpdateGoalsDialog";

export default function WealthPlan() {
  const { data: activePlan, isLoading } = useActiveWealthPlan();
  const createPlan = useCreateWealthPlan();
  const updatePlan = useUpdateWealthPlan();
  const [goalsOpen, setGoalsOpen] = useState(false);

  // Extract data from active plan or use defaults
  const goals = (activePlan?.goals as any) || {};
  const strategies = (activePlan?.strategies as any) || {};
  const projectedOutcome = (activePlan?.projected_outcome as any) || {};

  const projectedIncome = projectedOutcome?.monthly_income ?? "$2,500";
  const stabilityIndex = projectedOutcome?.stability_index ?? "42/100";
  const activeStreams = strategies?.active_streams ?? "2 active";
  const savingsRate = projectedOutcome?.savings_rate ?? "15%";

  const handleCreatePlan = () => {
    createPlan.mutate({
      plan_type: "wealth_builder",
      timeline_months: 12,
      goals: {
        emergency_fund: 10000,
        credit_score: 720,
        income_streams: 3,
        savings_rate: 30,
      },
      strategies: {
        active_streams: "0 active",
        income_sources: [],
      },
      projected_outcome: {
        monthly_income: "$0",
        stability_index: "0/100",
        savings_rate: "0%",
      },
    });
  };

  const handleSaveGoals = (newGoals: WealthGoals) => {
    if (!activePlan) return;
    updatePlan.mutate(
      {
        id: activePlan.id,
        goals: {
          emergency_fund: newGoals.emergency_fund,
          credit_score: newGoals.credit_score,
          income_streams: newGoals.income_streams,
          savings_rate: newGoals.savings_rate,
        },
        timeline_months: newGoals.timeline_months,
      },
      { onSuccess: () => setGoalsOpen(false) }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Wealth Plan</h1>
          <p className="text-muted-foreground mt-1">
            Your personalized roadmap to financial freedom
          </p>
        </div>
        {!activePlan ? (
          <Button 
            variant="premium" 
            onClick={handleCreatePlan}
            disabled={createPlan.isPending}
          >
            {createPlan.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Target className="w-4 h-4 mr-2" />
            )}
            Create Plan
          </Button>
        ) : (
          <Button variant="premium" onClick={() => setGoalsOpen(true)}>
            <Target className="w-4 h-4 mr-2" />
            Update Goals
          </Button>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Projected Monthly Income"
          value={typeof projectedIncome === "string" ? projectedIncome : `$${projectedIncome.toLocaleString()}`}
          icon={DollarSign}
          iconColor="text-success"
        />
        <StatCard
          title="Wealth Stability Index"
          value={String(stabilityIndex)}
          icon={TrendingUp}
          iconColor="text-primary"
        />
        <StatCard
          title="Income Streams"
          value={String(activeStreams)}
          icon={Briefcase}
          iconColor="text-accent"
        />
        <StatCard
          title="Savings Rate"
          value={typeof savingsRate === "string" ? savingsRate : `${savingsRate}%`}
          icon={PiggyBank}
          iconColor="text-warning"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <WealthPhases 
          goals={goals} 
          timelineMonths={activePlan?.timeline_months ?? 12} 
        />
        <DailyActions />
      </div>

      <IncomeStreams strategies={strategies} />

      <UpdateGoalsDialog
        open={goalsOpen}
        onOpenChange={setGoalsOpen}
        activePlan={activePlan}
        onSave={handleSaveGoals}
        saving={updatePlan.isPending}
      />
    </div>
  );
}
