import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Crown, 
  Zap, 
  Shield, 
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Lock,
  Target,
  DollarSign,
  TrendingUp,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";

const fundingSequence = [
  {
    step: 1,
    name: "Credit Union Membership",
    type: "Foundation",
    funding: "$500 - $2,000",
    timeline: "Immediate",
    status: "available",
    description: "Join a credit union and establish relationship",
  },
  {
    step: 2,
    name: "Secured Credit Cards",
    type: "Credit Building",
    funding: "$200 - $1,000",
    timeline: "Week 1",
    status: "available",
    description: "OpenSky, Discover It Secured, Capital One Secured",
  },
  {
    step: 3,
    name: "Credit Builder Loan",
    type: "Credit Building",
    funding: "$1,000 - $3,000",
    timeline: "Week 2",
    status: "recommended",
    description: "Self, MoneyLion, or credit union builder loan",
  },
  {
    step: 4,
    name: "Store Credit Cards",
    type: "Credit Mix",
    funding: "$300 - $1,000",
    timeline: "Month 2",
    status: "upcoming",
    description: "Target, Amazon, Home Depot store cards",
  },
  {
    step: 5,
    name: "Unsecured Credit Cards",
    type: "Major Milestone",
    funding: "$3,000 - $10,000",
    timeline: "Month 3-4",
    status: "locked",
    description: "Discover, Capital One, Chase Freedom",
  },
  {
    step: 6,
    name: "Personal Line of Credit",
    type: "Funding",
    funding: "$5,000 - $25,000",
    timeline: "Month 4-6",
    status: "locked",
    description: "Bank personal LOC with established relationship",
  },
  {
    step: 7,
    name: "Business Entity Formation",
    type: "Business Credit",
    funding: "N/A",
    timeline: "Month 6",
    status: "locked",
    description: "LLC formation, EIN, business bank account",
  },
  {
    step: 8,
    name: "Business Credit Cards",
    type: "Business Credit",
    funding: "$10,000 - $50,000",
    timeline: "Month 6-9",
    status: "locked",
    description: "Chase Ink, Amex Business, Capital One Spark",
  },
  {
    step: 9,
    name: "Business Lines of Credit",
    type: "Business Funding",
    funding: "$25,000 - $100,000",
    timeline: "Month 9-12",
    status: "locked",
    description: "Bank business LOC, Kabbage, Fundbox",
  },
  {
    step: 10,
    name: "SBA Microloans",
    type: "Business Funding",
    funding: "$50,000 - $500,000",
    timeline: "Year 1-2",
    status: "locked",
    description: "SBA 7(a), microloans, community lenders",
  },
];

const statusConfig = {
  available: { color: "text-success", bg: "bg-success/10", border: "border-success/30" },
  recommended: { color: "text-primary", bg: "bg-primary/10", border: "border-primary/30" },
  upcoming: { color: "text-warning", bg: "bg-warning/10", border: "border-warning/30" },
  locked: { color: "text-muted-foreground", bg: "bg-muted", border: "border-border" },
};

export default function MillionMode() {
  const [activating, setActivating] = useState(false);

  const totalPotential = "$500K - $1M+";
  const currentUnlocked = 3;
  const totalSteps = fundingSequence.length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Header */}
      <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-accent/10 p-8 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />
        
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-gold shadow-glow-lg">
              <Crown className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gradient-gold">Million Mode</h1>
              <p className="text-muted-foreground">Elite funding sequence activated</p>
            </div>
          </div>

          <p className="text-foreground max-w-2xl mb-6">
            The Million Mode is your strategic roadmap to unlocking up to <span className="text-gradient-gold font-bold">$1,000,000+</span> in 
            funding through carefully sequenced credit and business applications.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-lg bg-card/50 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Total Potential</p>
              <p className="text-xl font-bold text-gradient-gold">{totalPotential}</p>
            </div>
            <div className="p-4 rounded-lg bg-card/50 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Steps Unlocked</p>
              <p className="text-xl font-bold text-foreground">{currentUnlocked}/{totalSteps}</p>
            </div>
            <div className="p-4 rounded-lg bg-card/50 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Current Phase</p>
              <p className="text-xl font-bold text-primary">Foundation</p>
            </div>
            <div className="p-4 rounded-lg bg-card/50 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Next Milestone</p>
              <p className="text-xl font-bold text-success">$10K</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="premium" size="lg" disabled={activating}>
              {activating ? (
                <>
                  <Zap className="w-5 h-5 animate-pulse" />
                  Activating...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Execute Next Step
                </>
              )}
            </Button>
            <Button variant="outline" size="lg">
              View Full Plan
            </Button>
          </div>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
        <div>
          <p className="text-sm font-medium text-foreground">Human Review Required</p>
          <p className="text-xs text-muted-foreground">
            Each funding application requires your explicit consent and admin approval before submission. 
            Hard credit pulls are limited to 2 per 48 hours to protect your score.
          </p>
        </div>
      </div>

      {/* Funding Sequence */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Funding Sequence</h2>
        <div className="relative">
          {/* Progress line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border">
            <div 
              className="w-full bg-gradient-to-b from-primary to-primary/50 transition-all duration-500"
              style={{ height: `${(currentUnlocked / totalSteps) * 100}%` }}
            />
          </div>

          <div className="space-y-4">
            {fundingSequence.map((step, index) => {
              const config = statusConfig[step.status as keyof typeof statusConfig];
              const isLocked = step.status === "locked";

              return (
                <div
                  key={index}
                  className={cn(
                    "relative flex gap-4 pl-14 pr-4 py-4 rounded-xl border transition-all",
                    config.border,
                    isLocked ? "opacity-60" : "hover:shadow-lg cursor-pointer"
                  )}
                >
                  {/* Step indicator */}
                  <div className={cn(
                    "absolute left-3 top-6 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
                    config.bg,
                    config.color
                  )}>
                    {isLocked ? <Lock className="w-3 h-3" /> : step.step}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{step.name}</h3>
                          <span className={cn(
                            "px-2 py-0.5 rounded text-xs font-medium",
                            config.bg,
                            config.color
                          )}>
                            {step.status === "available" ? "Available Now" :
                             step.status === "recommended" ? "Recommended" :
                             step.status === "upcoming" ? "Coming Soon" : "Locked"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{step.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gradient-gold">{step.funding}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                          <Calendar className="w-3 h-3" />
                          {step.timeline}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{step.description}</p>

                    {!isLocked && (
                      <div className="flex items-center gap-2 mt-3">
                        <Button 
                          variant={step.status === "available" ? "glow" : "outline"} 
                          size="sm"
                        >
                          {step.status === "available" ? "Start Application" : "View Details"}
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Requirements to Unlock */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Requirements to Unlock Next Phase</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-success/10 border border-success/30">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <div>
              <p className="text-sm font-medium text-foreground">Credit Score 620+</p>
              <p className="text-xs text-success">Achieved: 558 → In Progress</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted border border-border">
            <Target className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">3+ Months History</p>
              <p className="text-xs text-muted-foreground">Current: 2 months</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted border border-border">
            <DollarSign className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">Utilization Under 30%</p>
              <p className="text-xs text-muted-foreground">Current: 89%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
