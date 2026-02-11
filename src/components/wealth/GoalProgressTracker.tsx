import { Progress } from "@/components/ui/progress";
import { Target, DollarSign, TrendingUp, PiggyBank, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface GoalProgressTrackerProps {
  goals: Record<string, any>;
  projectedOutcome: Record<string, any>;
  strategies: Record<string, any>;
  stats?: {
    currentScore?: number | null;
    savingsRate?: number;
    emergencyFund?: number;
    incomeStreams?: number;
  };
}

interface GoalItem {
  label: string;
  icon: React.ElementType;
  current: number;
  target: number;
  unit: string;
  format: (v: number) => string;
}

export function GoalProgressTracker({
  goals,
  projectedOutcome,
  strategies,
  stats,
}: GoalProgressTrackerProps) {
  const goalItems: GoalItem[] = [
    {
      label: "Emergency Fund",
      icon: DollarSign,
      current: stats?.emergencyFund ?? (parseFloat(String(projectedOutcome?.monthly_income ?? "0").replace(/[^0-9.]/g, "")) * 2 || 0),
      target: goals?.emergency_fund ?? 10000,
      unit: "$",
      format: (v) => `$${v.toLocaleString()}`,
    },
    {
      label: "Credit Score",
      icon: TrendingUp,
      current: stats?.currentScore ?? 580,
      target: goals?.credit_score ?? 720,
      unit: "pts",
      format: (v) => String(Math.round(v)),
    },
    {
      label: "Income Streams",
      icon: Briefcase,
      current: stats?.incomeStreams ?? (parseInt(String(strategies?.active_streams ?? "0").replace(/[^0-9]/g, ""), 10) || 0),
      target: goals?.income_streams ?? 3,
      unit: "",
      format: (v) => String(Math.round(v)),
    },
    {
      label: "Savings Rate",
      icon: PiggyBank,
      current: stats?.savingsRate ?? (parseFloat(String(projectedOutcome?.savings_rate ?? "0").replace(/[^0-9.]/g, "")) || 0),
      target: goals?.savings_rate ?? 30,
      unit: "%",
      format: (v) => `${Math.round(v)}%`,
    },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-2 mb-5">
        <Target className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Goal Progress</h2>
      </div>

      <div className="space-y-5">
        {goalItems.map((goal) => {
          const pct = goal.target > 0 ? Math.min(Math.round((goal.current / goal.target) * 100), 100) : 0;
          const isComplete = pct >= 100;

          const tooltipText = isComplete
            ? `${goal.label}: Goal reached! You hit ${goal.format(goal.target)}.`
            : `${goal.label}: ${goal.format(goal.current)} of ${goal.format(goal.target)} (${pct}%). ${goal.format(goal.target - goal.current)} remaining.`;

          return (
            <TooltipProvider key={goal.label} delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="space-y-2 cursor-default">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <goal.icon className={cn("w-4 h-4", isComplete ? "text-success" : "text-muted-foreground")} />
                        <span className="text-sm font-medium text-foreground">{goal.label}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {goal.format(goal.current)} / {goal.format(goal.target)}
                      </span>
                    </div>

                    <Progress
                      value={pct}
                      className={cn("h-2.5", isComplete && "[&>div]:bg-success")}
                    />

                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          "text-xs font-medium",
                          isComplete ? "text-success" : pct >= 60 ? "text-primary" : "text-muted-foreground"
                        )}
                      >
                        {isComplete ? "✓ Goal reached!" : `${pct}% complete`}
                      </span>
                      {!isComplete && (
                        <span className="text-xs text-muted-foreground">
                          {goal.format(goal.target - goal.current)} to go
                        </span>
                      )}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-xs text-sm">
                  <p>{tooltipText}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    </div>
  );
}
