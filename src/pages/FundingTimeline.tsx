import { useState, useEffect } from "react";
import { FundingProbabilityCard } from "@/components/FundingProbabilityCard";
import { TimelineChart } from "@/components/TimelineChart";
import { Button } from "@/components/ui/button";
import { 
  Target, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  ArrowRight,
  CheckCircle2,
  Clock,
  Loader2,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFundingTimeline, FundingProjection } from "@/hooks/useFundingTimeline";
import { useScoreHistory } from "@/hooks/useTradelines";
import { Link } from "react-router-dom";
import { PageSkeleton } from "@/components/SkeletonLoaders";
import { EmptyState } from "@/components/EmptyState";

const statusConfig = {
  achievable: { icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
  "on-track": { icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
  projected: { icon: Clock, color: "text-muted-foreground", bg: "bg-muted" },
  future: { icon: Target, color: "text-muted-foreground", bg: "bg-muted/50" },
};

function getStatus(probability: number): "achievable" | "on-track" | "projected" | "future" {
  if (probability >= 80) return "achievable";
  if (probability >= 60) return "on-track";
  if (probability >= 30) return "projected";
  return "future";
}

export default function FundingTimeline() {
  const { calculateProjections, loading, authLoading, result } = useFundingTimeline();
  const { data: scoreHistory } = useScoreHistory();
  const [hasCalculated, setHasCalculated] = useState(false);

  // Auto-calculate on first load (wait for auth to be ready)
  useEffect(() => {
    if (!hasCalculated && !loading && !authLoading && !result) {
      calculateProjections();
      setHasCalculated(true);
    }
  }, [hasCalculated, loading, authLoading, result]);

  const projections = result?.projections || [];
  const currentProfile = result?.currentProfile;

  // Build chart data from score history or current profile
  const chartData = scoreHistory && scoreHistory.length > 0
    ? scoreHistory.map(s => ({ date: s.date, score: s.score }))
    : currentProfile
      ? [{ date: "Now", score: currentProfile.score }]
      : [{ date: "Now", score: 580 }];

  // Add projections to chart
  if (projections.length > 0) {
    const scoreTargets = [620, 680, 720, 750];
    const currentScore = currentProfile?.score || 580;
    
    scoreTargets.forEach((targetScore, index) => {
      if (targetScore > currentScore) {
        const monthsNeeded = Math.ceil((targetScore - currentScore) / 15);
        const projectionDate = new Date();
        projectionDate.setMonth(projectionDate.getMonth() + monthsNeeded);
        chartData.push({
          date: projectionDate.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
          score: targetScore,
          projected: true,
        } as any);
      }
    });
  }

  const totalPotential = projections.reduce((acc, p) => acc + p.target, 0);
  const firstAchievable = projections.find(p => p.probability >= 80);
  const nextMilestone = projections.find(p => p.probability >= 50 && p.probability < 80);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Funding Timeline</h1>
          <p className="text-muted-foreground mt-1">
            Your roadmap to unlocking funding opportunities
          </p>
        </div>
        <Button 
          variant="premium" 
          onClick={() => calculateProjections()}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          {loading ? "Calculating..." : "Recalculate"}
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">Total Potential</span>
          </div>
          <p className="text-2xl font-bold text-gradient-gold">
            ${(totalPotential / 1000000).toFixed(1)}M+
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <span className="text-sm text-muted-foreground">Currently Qualified</span>
          </div>
          <p className="text-2xl font-bold text-success">
            ${firstAchievable ? firstAchievable.target.toLocaleString() : "Calculating..."}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">Next Milestone</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            ${nextMilestone ? nextMilestone.target.toLocaleString() : "-"}
          </p>
          {nextMilestone && (
            <p className="text-xs text-muted-foreground">{nextMilestone.probability}% likely</p>
          )}
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-accent" />
            <span className="text-sm text-muted-foreground">Current Score</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {currentProfile?.score || "Add data"}
          </p>
          {currentProfile && (
            <p className="text-xs text-muted-foreground">{currentProfile.utilization}% utilization</p>
          )}
        </div>
      </div>

      {/* Credit Score Projection */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Credit Score Projection</h2>
          <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded">
            Following recommended actions
          </span>
        </div>
        <TimelineChart data={chartData} targetScore={750} />
      </div>

      {/* Funding Milestones Timeline */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : projections.length > 0 ? (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Funding Milestones</h2>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

            <div className="space-y-4">
              {projections.map((milestone, index) => {
                const status = getStatus(milestone.probability);
                const config = statusConfig[status];
                const StatusIcon = config.icon;

                return (
                  <div
                    key={index}
                    className={cn(
                      "relative flex gap-4 pl-14 pr-4 py-4 rounded-xl border bg-card transition-all duration-300",
                      status === "achievable" ? "border-success/30" :
                      status === "on-track" ? "border-primary/30" : "border-border",
                      "hover:shadow-lg hover:border-primary/30"
                    )}
                  >
                    {/* Timeline dot */}
                    <div className={cn(
                      "absolute left-4 top-6 w-5 h-5 rounded-full flex items-center justify-center",
                      config.bg
                    )}>
                      <StatusIcon className={cn("w-3 h-3", config.color)} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-2xl font-bold text-gradient-gold">
                              ${milestone.target >= 1000000 
                                ? `${(milestone.target / 1000000).toFixed(1)}M`
                                : milestone.target >= 1000 
                                  ? `${milestone.target / 1000}K`
                                  : milestone.target
                              }
                            </span>
                            <span className={cn(
                              "px-2 py-0.5 rounded text-xs font-medium",
                              milestone.confidence === "high" ? "bg-success/20 text-success" :
                              milestone.confidence === "medium" ? "bg-primary/20 text-primary" :
                              "bg-warning/20 text-warning"
                            )}>
                              {milestone.probability}% likely
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Target: {milestone.targetMonth}
                          </p>
                        </div>

                        <Button
                          variant={status === "achievable" ? "premium" : "outline"}
                          size="sm"
                          className="shrink-0"
                        >
                          {status === "achievable" ? "Apply Now" : "View Plan"}
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>

                      {/* Requirements */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {milestone.requirements.map((req, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs"
                          >
                            {req}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Target}
          title="Add Credit Data First"
          description="Add your tradelines and credit scores to calculate personalized funding projections and unlock your funding timeline."
          actionLabel="Add Credit Data"
          onAction={() => window.location.href = "/app/credit"}
        />
      )}

      {/* Call to Action */}
      <div className="rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 via-card to-accent/10 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              Ready to accelerate your funding journey?
            </h3>
            <p className="text-sm text-muted-foreground">
              Activate Million Mode to unlock advanced funding sequences and maximize your capital potential.
            </p>
          </div>
          <Link to="/app/million-mode">
            <Button variant="premium" size="lg">
              Activate Million Mode
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
