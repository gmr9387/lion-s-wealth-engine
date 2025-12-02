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
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

const fundingMilestones = [
  {
    amount: 5000,
    probability: 95,
    confidence: "high" as const,
    targetMonth: "Jan 2025",
    requirements: ["Score 580+", "Any income proof"],
    status: "achievable",
    description: "Starter credit cards and small personal loans",
  },
  {
    amount: 10000,
    probability: 85,
    confidence: "high" as const,
    targetMonth: "Mar 2025",
    requirements: ["Score 620+", "3 months credit history", "Checking account"],
    status: "on-track",
    description: "Personal loans and unsecured credit cards",
  },
  {
    amount: 25000,
    probability: 65,
    confidence: "medium" as const,
    targetMonth: "Jun 2025",
    requirements: ["Score 680+", "Income verification", "6 months history"],
    status: "projected",
    description: "Premium cards, higher credit limits, business starter",
  },
  {
    amount: 50000,
    probability: 50,
    confidence: "medium" as const,
    targetMonth: "Sep 2025",
    requirements: ["Score 700+", "Stable income", "Low utilization"],
    status: "projected",
    description: "Business credit cards, lines of credit",
  },
  {
    amount: 100000,
    probability: 40,
    confidence: "low" as const,
    targetMonth: "Dec 2025",
    requirements: ["Score 720+", "Business entity", "Tax returns", "Bank statements"],
    status: "projected",
    description: "Business funding, SBA microloans, equipment financing",
  },
  {
    amount: 500000,
    probability: 25,
    confidence: "low" as const,
    targetMonth: "Jun 2026",
    requirements: ["Score 750+", "2 years in business", "Strong revenue", "Collateral"],
    status: "future",
    description: "Major business loans, commercial real estate",
  },
  {
    amount: 1000000,
    probability: 15,
    confidence: "low" as const,
    targetMonth: "Dec 2026",
    requirements: ["Excellent credit", "Established business", "Multiple funding sources"],
    status: "future",
    description: "Elite funding - SBA loans, private lending, credit stacking",
  },
];

const creditProjection = [
  { date: "Dec '24", score: 558 },
  { date: "Jan '25", score: 590, projected: true },
  { date: "Mar '25", score: 620, projected: true },
  { date: "Jun '25", score: 680, projected: true },
  { date: "Sep '25", score: 710, projected: true },
  { date: "Dec '25", score: 740, projected: true },
];

const statusConfig = {
  achievable: { icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
  "on-track": { icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
  projected: { icon: Clock, color: "text-muted-foreground", bg: "bg-muted" },
  future: { icon: Target, color: "text-muted-foreground", bg: "bg-muted/50" },
};

export default function FundingTimeline() {
  const totalPotential = fundingMilestones.reduce((acc, m) => acc + m.amount, 0);

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
        <Button variant="premium">
          <Target className="w-4 h-4 mr-2" />
          Recalculate Projections
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
          <p className="text-2xl font-bold text-success">$5,000</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">Next Milestone</span>
          </div>
          <p className="text-2xl font-bold text-foreground">$10,000</p>
          <p className="text-xs text-muted-foreground">in 90 days</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-accent" />
            <span className="text-sm text-muted-foreground">$100K Target</span>
          </div>
          <p className="text-2xl font-bold text-foreground">Dec 2025</p>
          <p className="text-xs text-muted-foreground">12 months away</p>
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
        <TimelineChart data={creditProjection} targetScore={750} />
      </div>

      {/* Funding Milestones Timeline */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Funding Milestones</h2>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-4">
            {fundingMilestones.map((milestone, index) => {
              const config = statusConfig[milestone.status as keyof typeof statusConfig];
              const StatusIcon = config.icon;

              return (
                <div
                  key={index}
                  className={cn(
                    "relative flex gap-4 pl-14 pr-4 py-4 rounded-xl border bg-card transition-all duration-300",
                    milestone.status === "achievable" ? "border-success/30" :
                    milestone.status === "on-track" ? "border-primary/30" : "border-border",
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
                            ${milestone.amount >= 1000000 
                              ? `${(milestone.amount / 1000000).toFixed(1)}M`
                              : milestone.amount >= 1000 
                                ? `${milestone.amount / 1000}K`
                                : milestone.amount
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
                        <p className="text-sm text-foreground mb-1">{milestone.description}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Target: {milestone.targetMonth}
                        </p>
                      </div>

                      <Button
                        variant={milestone.status === "achievable" ? "premium" : "outline"}
                        size="sm"
                        className="shrink-0"
                      >
                        {milestone.status === "achievable" ? "Apply Now" : "View Plan"}
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
          <Button variant="premium" size="lg">
            Activate Million Mode
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
