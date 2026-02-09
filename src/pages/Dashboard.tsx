import { useEffect, useState } from "react";
import { CreditScoreDial } from "@/components/CreditScoreDial";
import { NextBestMoveCard } from "@/components/NextBestMoveCard";
import { ActionTaskList } from "@/components/ActionTaskList";
import { ScoreHistoryChart } from "@/components/ScoreHistoryChart";
import { DashboardFunding } from "@/components/DashboardFunding";
import { StatCard } from "@/components/StatCard";
import { DashboardSkeleton } from "@/components/SkeletonLoaders";
import { CreditCard, TrendingUp, Target, DollarSign, Shield, Zap, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNextBestMove } from "@/hooks/useNextBestMove";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useRealtimeDashboard } from "@/hooks/useRealtimeDashboard";
import { Button } from "@/components/ui/button";
import { OnboardingWizard } from "@/components/OnboardingWizard";
import { useOnboardingStatus } from "@/hooks/useProfile";

// Funding targets are now pulled from useFundingTimeline hook

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { checkComplete, markComplete } = useOnboardingStatus();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  useRealtimeDashboard(user?.id);
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

  // Show onboarding for new users
  useEffect(() => {
    if (user && !authLoading && !checkComplete()) {
      setShowOnboarding(true);
    }
  }, [user, authLoading]);

  const handleOnboardingComplete = () => {
    markComplete();
    setShowOnboarding(false);
  };

  if (authLoading || statsLoading) {
    return <DashboardSkeleton />;
  }

  // Use real data with sensible fallbacks
  const currentScore = stats?.currentScore ?? null;
  const previousScore = stats?.previousScore ?? null;
  const scoreChange = stats?.scoreChange ?? 0;
  const scoreBureau = stats?.scoreBureau ?? "TransUnion";
  const hasScoreData = currentScore !== null;

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount.toLocaleString()}`;
  };

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
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Your credit transformation journey continues
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={generateActions}
            disabled={generating}
            className="gap-2 text-xs sm:text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
            <span className="hidden xs:inline">{generating ? 'Analyzing...' : 'Refresh'}</span>
          </Button>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-primary">Secured</span>
          </div>
        </div>
      </div>

      {/* Stats Grid — wired to real data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Credit Score"
          value={hasScoreData ? String(currentScore) : "—"}
          change={scoreChange !== 0 ? scoreChange : undefined}
          changeLabel={scoreChange !== 0 ? "since last" : undefined}
          icon={CreditCard}
          iconColor="text-primary"
        />
        <StatCard
          title="Negative Items"
          value={String(stats?.negativeTradelines ?? 0)}
          changeLabel={`of ${stats?.totalTradelines ?? 0} tradelines`}
          icon={TrendingUp}
          iconColor="text-warning"
        />
        <StatCard
          title="Active Disputes"
          value={String(stats?.activeDisputes ?? 0)}
          changeLabel="in progress"
          icon={Target}
          iconColor="text-accent"
        />
        <StatCard
          title="Available Credit"
          value={formatCurrency(stats?.totalCreditLimit ? stats.totalCreditLimit - (stats.totalBalance ?? 0) : 0)}
          change={stats?.utilization ? -stats.utilization : undefined}
          changeLabel={stats?.utilization ? "% utilization" : undefined}
          icon={DollarSign}
          iconColor="text-success"
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
                score={currentScore ?? 300}
                previousScore={previousScore ?? undefined}
                bureau={scoreBureau}
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

          {/* Score History Chart - Now uses real data */}
          <div className="rounded-xl border border-border bg-card p-6">
            <ScoreHistoryChart />
          </div>
        </div>

        {/* Action Tasks */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Action Queue</h2>
            <Zap className="w-5 h-5 text-primary" />
          </div>
          {actionsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse space-y-2 p-3 rounded-lg border border-border">
                  <div className="h-4 w-3/4 bg-muted/60 rounded" />
                  <div className="h-3 w-full bg-muted/60 rounded" />
                  <div className="h-3 w-1/2 bg-muted/60 rounded" />
                </div>
              ))}
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
      <DashboardFunding />

      <OnboardingWizard 
        open={showOnboarding} 
        onOpenChange={setShowOnboarding} 
        onComplete={handleOnboardingComplete}
      />
    </div>
  );
}
