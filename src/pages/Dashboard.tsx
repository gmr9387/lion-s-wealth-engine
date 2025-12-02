import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CreditScoreDial } from "@/components/CreditScoreDial";
import { NextBestMoveCard } from "@/components/NextBestMoveCard";
import { ActionTaskList, ActionTask } from "@/components/ActionTaskList";
import { TimelineChart } from "@/components/TimelineChart";
import { FundingProbabilityCard } from "@/components/FundingProbabilityCard";
import { StatCard } from "@/components/StatCard";
import { CreditCard, TrendingUp, Target, DollarSign, Shield, Zap } from "lucide-react";
import { User } from "@supabase/supabase-js";

// Demo data for EXAMPLE_USER scenario
const demoScoreHistory = [
  { date: "Oct", score: 520 },
  { date: "Nov", score: 535 },
  { date: "Dec", score: 548 },
  { date: "Jan", score: 558 },
  { date: "Feb", score: 585, projected: true },
  { date: "Mar", score: 620, projected: true },
  { date: "Apr", score: 660, projected: true },
];

const demoTasks: ActionTask[] = [
  {
    id: "1",
    title: "Pay down Capital One balance to 30%",
    description: "Reduce utilization from 89% to under 30% for +35 point impact",
    status: "pending",
    priority: "critical",
    estimatedImpact: 35,
    dueDate: "Dec 15",
    humanRequired: false,
  },
  {
    id: "2",
    title: "Dispute late payment on Discover",
    description: "30-day late from March 2024 - goodwill removal eligible",
    status: "pending",
    priority: "high",
    estimatedImpact: 20,
    humanRequired: true,
  },
  {
    id: "3",
    title: "Apply for secured card",
    description: "OpenSky or Discover It Secured - build positive history",
    status: "pending",
    priority: "medium",
    estimatedImpact: 15,
    dueDate: "Dec 20",
    humanRequired: true,
  },
  {
    id: "4",
    title: "Request credit limit increase",
    description: "Soft pull CLI on existing Capital One card",
    status: "in_progress",
    priority: "medium",
    estimatedImpact: 10,
    humanRequired: false,
  },
];

const fundingTargets = [
  { amount: 10000, probability: 85, confidence: "high" as const, date: "90 days", requirements: ["Score 620+", "3 months history"] },
  { amount: 25000, probability: 65, confidence: "medium" as const, date: "6 months", requirements: ["Score 680+", "Income verification"] },
  { amount: 100000, probability: 40, confidence: "low" as const, date: "12 months", requirements: ["Score 720+", "Business entity", "Tax returns"] },
];

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

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
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
          <Shield className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-primary">All actions secured</span>
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
          title="Active Disputes"
          value="3"
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
            <NextBestMoveCard
              title="Pay Down Capital One"
              description="Reducing your balance from $2,680 to $900 will drop utilization from 89% to 30%, potentially adding 35+ points."
              impact={35}
              urgency="critical"
              estimatedTime="2-3 days"
              category="Utilization"
            />
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
          <ActionTaskList tasks={demoTasks} />
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
