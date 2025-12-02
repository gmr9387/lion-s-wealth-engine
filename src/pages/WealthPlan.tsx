import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/StatCard";
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Target,
  Briefcase,
  PiggyBank,
  Building2,
  ArrowRight,
  CheckCircle2,
  Clock,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

const incomeStreams = [
  {
    name: "Gig Economy",
    type: "active",
    potential: "$1,000 - $3,000/mo",
    status: "active",
    description: "DoorDash, Uber, TaskRabbit",
  },
  {
    name: "Freelance Services",
    type: "active",
    potential: "$500 - $2,000/mo",
    status: "recommended",
    description: "Skills-based services on Fiverr, Upwork",
  },
  {
    name: "Reselling",
    type: "semi-passive",
    potential: "$300 - $1,500/mo",
    status: "recommended",
    description: "Amazon FBA, eBay arbitrage",
  },
  {
    name: "Content Creation",
    type: "passive",
    potential: "$0 - $5,000/mo",
    status: "future",
    description: "YouTube, TikTok, blogging",
  },
  {
    name: "Dividend Income",
    type: "passive",
    potential: "Variable",
    status: "future",
    description: "Stock dividends, REITs",
  },
];

const wealthPhases = [
  {
    phase: "Foundation",
    timeline: "Month 1-3",
    goals: [
      "Emergency fund: $1,000",
      "Credit score: 620+",
      "Income verification docs",
    ],
    status: "in-progress",
  },
  {
    phase: "Stability",
    timeline: "Month 4-6",
    goals: [
      "Emergency fund: $3,000",
      "Credit score: 680+",
      "2+ income streams",
      "Business entity formed",
    ],
    status: "upcoming",
  },
  {
    phase: "Growth",
    timeline: "Month 7-12",
    goals: [
      "Emergency fund: $10,000",
      "Credit score: 720+",
      "Business credit established",
      "Asset acquisition started",
    ],
    status: "upcoming",
  },
  {
    phase: "Acceleration",
    timeline: "Year 2+",
    goals: [
      "Net worth: $100,000+",
      "Multiple funding sources",
      "Real estate investment",
      "Passive income: $2,000+/mo",
    ],
    status: "future",
  },
];

const dailyActions = [
  {
    title: "Check DoorDash peak pay zones",
    category: "Income",
    impact: "$50-150 potential",
    time: "5 min",
  },
  {
    title: "List 3 items for resale",
    category: "Income",
    impact: "$20-100 profit",
    time: "30 min",
  },
  {
    title: "Pay credit card balance",
    category: "Credit",
    impact: "Utilization drop",
    time: "2 min",
  },
  {
    title: "Apply for CLI (soft pull)",
    category: "Credit",
    impact: "+$500 limit",
    time: "5 min",
  },
];

const statusColors = {
  active: "bg-success/10 text-success border-success/30",
  recommended: "bg-primary/10 text-primary border-primary/30",
  future: "bg-muted text-muted-foreground border-border",
  "in-progress": "border-primary bg-primary/5",
  upcoming: "border-border",
};

export default function WealthPlan() {
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
        <Button variant="premium">
          <Target className="w-4 h-4 mr-2" />
          Update Goals
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Projected Monthly Income"
          value="$2,500"
          change={+850}
          changeLabel="vs last month"
          icon={DollarSign}
          iconColor="text-success"
        />
        <StatCard
          title="Wealth Stability Index"
          value="42/100"
          change={+12}
          changeLabel="improving"
          icon={TrendingUp}
          iconColor="text-primary"
        />
        <StatCard
          title="Income Streams"
          value="2 active"
          icon={Briefcase}
          iconColor="text-accent"
        />
        <StatCard
          title="Savings Rate"
          value="15%"
          change={+5}
          changeLabel="target: 30%"
          icon={PiggyBank}
          iconColor="text-warning"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wealth Phases */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Wealth Building Phases</h2>
          <div className="space-y-4">
            {wealthPhases.map((phase, index) => (
              <div
                key={index}
                className={cn(
                  "rounded-lg border p-4 transition-all",
                  statusColors[phase.status as keyof typeof statusColors]
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                      phase.status === "in-progress" 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted text-muted-foreground"
                    )}>
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{phase.phase}</h3>
                      <p className="text-xs text-muted-foreground">{phase.timeline}</p>
                    </div>
                  </div>
                  {phase.status === "in-progress" && (
                    <span className="px-2 py-1 bg-primary/20 text-primary rounded text-xs font-medium">
                      Current Phase
                    </span>
                  )}
                </div>
                <ul className="space-y-2 ml-11">
                  {phase.goals.map((goal, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      {phase.status === "in-progress" ? (
                        <Clock className="w-4 h-4 text-primary" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className={phase.status === "in-progress" ? "text-foreground" : "text-muted-foreground"}>
                        {goal}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Actions */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Today's Actions</h2>
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div className="space-y-3">
            {dailyActions.map((action, index) => (
              <div
                key={index}
                className="p-3 rounded-lg border border-border hover:border-primary/30 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-1">
                  <h4 className="text-sm font-medium text-foreground">{action.title}</h4>
                  <span className="text-xs text-muted-foreground">{action.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 bg-secondary rounded text-secondary-foreground">
                    {action.category}
                  </span>
                  <span className="text-xs text-success">{action.impact}</span>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4">
            View All Actions
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Income Streams */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Income Stream Opportunities</h2>
          <Button variant="glow" size="sm">
            Add Income Stream
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {incomeStreams.map((stream, index) => (
            <div
              key={index}
              className={cn(
                "rounded-lg border p-4 transition-all hover:shadow-md",
                statusColors[stream.status as keyof typeof statusColors]
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-foreground">{stream.name}</h3>
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded capitalize",
                  stream.type === "active" ? "bg-primary/20 text-primary" :
                  stream.type === "semi-passive" ? "bg-accent/20 text-accent" :
                  "bg-success/20 text-success"
                )}>
                  {stream.type}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{stream.description}</p>
              <p className="text-sm font-medium text-success">{stream.potential}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
