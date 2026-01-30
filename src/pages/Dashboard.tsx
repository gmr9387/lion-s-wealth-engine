import { useEffect } from "react";
import { CreditScoreDial } from "@/components/CreditScoreDial";
import { NextBestMoveCard } from "@/components/NextBestMoveCard";
import { ActionTaskList } from "@/components/ActionTaskList";
import { TimelineChart } from "@/components/TimelineChart";
import { FundingProbabilityCard } from "@/components/FundingProbabilityCard";
import { StatCard } from "@/components/StatCard";
import { CreditCard, TrendingUp, Target, DollarSign, Shield, Zap, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNextBestMove } from "@/hooks/useNextBestMove";
import { Button } from "@/components/ui/button";

// Demo data for score history (will be replaced with real data later)
const demoScoreHistory = [
  { date: "Oct", score: 520 },
  { date: "Nov", score: 535 },
  { date: "Dec", score: 548 },
  { date: "Jan", score: 558 },
  { date: "Feb", score: 585, projected: true },
  { date: "Mar", score: 620, projected: true },
  { date: "Apr", score: 660, projected: true },
];

const fundingTargets = [
  { amount: 10000, probability: 85, confidence: "high" as const, date: "90 days", requirements: ["Score 620+", "3 months history"] },
  { amount: 25000, probability: 65, confidence: "medium" as const, date: "6 months", requirements: ["Score 680+", "Income verification"] },
  { amount: 100000, probability: 40, confidence: "low" as const, date: "12 months", requirements: ["Score 720+", "Business entity", "Tax returns"] },
];

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const { 
    actions, 
    nextBestMove, 
    loading: actionsLoading, 
    generating, 
    generateActions,
    completeAction,
    startAction,
  } = useNextBestMove();

  // Auto-generate actions on first load if none exist
  useEffect(() => {
    if (!actionsLoading && actions.length === 0 && user) {
      generateActions();
    }
  }, [actionsLoading, actions.length, user]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  // Map actions to ActionTask format
  const actionTasks = actions.map((action) => ({
    id: action.id,
    title: action.title,
    description: action.description || "",
    status: action.status || "pending",
    priority: action.priority || "medium",
    estimatedImpact: action.estimated_impact || 0,
    dueDate: action.due_date ? new Date(action.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : undefined,
    humanRequired: action.human_required || false,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-muted-foreground mt-1">
            Your credit transformation journey continues
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={generateActions}
            disabled={generating}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
            {generating ? 'Analyzing...' : 'Refresh Actions'}
          </Button>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary">All actions secured</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Credit Score"
          value="558"
          change={+38}
          changeLabel="this month"
          icon={CreditCard}
          iconColor="text-primary"
        />
        <StatCard
          title="Score Potential"
          value="720+"
          change={+162}
          changeLabel="achievable"
          icon={TrendingUp}
          iconColor="text-success"
        />
        <StatCard
          title="Active Actions"
          value={String(actions.length)}
          icon={Target}
          iconColor="text-warning"
        />
        <StatCard
          title="Available Credit"
          value="$1,200"
          change={-89}
          changeLabel="% utilization"
          icon={DollarSign}
          iconColor="text-accent"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Dial + Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Credit Score Dial */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-sm font-medium text-muted-foreground mb-4">Current Score</h2>
              <CreditScoreDial
                score={558}
                previousScore={520}
                bureau="TransUnion"
              />
            </div>

            {/* Next Best Move */}
            {nextBestMove ? (
              <NextBestMoveCard
                title={nextBestMove.title}
                description={nextBestMove.description || "Take this action to improve your credit."}
                impact={nextBestMove.estimated_impact || 20}
                urgency={nextBestMove.priority || "medium"}
                estimatedTime="2-3 days"
                category={nextBestMove.action_type.replace(/_/g, " ")}
                onAction={() => startAction(nextBestMove.id)}
              />
            ) : (
              <div className="rounded-xl border border-border bg-card p-6 flex flex-col items-center justify-center text-center">
                <Zap className="w-12 h-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">All Caught Up!</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  No pending actions. Click refresh to analyze for new opportunities.
                </p>
                <Button variant="outline" size="sm" onClick={generateActions} disabled={generating}>
                  {generating ? 'Analyzing...' : 'Check for Actions'}
                </Button>
              </div>
            )}
          </div>

          {/* Timeline Chart */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Score Roadmap</h2>
              <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded">
                30/60/90 day projection
              </span>
            </div>
            <TimelineChart data={demoScoreHistory} targetScore={700} />
          </div>
        </div>

        {/* Action Tasks */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Action Queue</h2>
            <Zap className="w-5 h-5 text-primary" />
          </div>
          {actionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-pulse text-muted-foreground">Loading actions...</div>
            </div>
          ) : actionTasks.length > 0 ? (
            <ActionTaskList 
              tasks={actionTasks} 
              onComplete={completeAction}
              onStart={startAction}
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-2">No pending actions</p>
              <Button variant="ghost" size="sm" onClick={generateActions} disabled={generating}>
                Generate Actions
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Funding Projections */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Funding Timeline</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {fundingTargets.map((target, i) => (
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
    </div>
  );
}
