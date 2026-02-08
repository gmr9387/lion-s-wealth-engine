import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConsentModal } from "@/components/ConsentModal";
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
  Calendar,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMillionMode, FundingSequenceStep } from "@/hooks/useMillionMode";
import { useLatestScores } from "@/hooks/useTradelines";

const defaultFundingSequence = [
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
];

const statusConfig = {
  available: { color: "text-success", bg: "bg-success/10", border: "border-success/30" },
  recommended: { color: "text-primary", bg: "bg-primary/10", border: "border-primary/30" },
  upcoming: { color: "text-warning", bg: "bg-warning/10", border: "border-warning/30" },
  locked: { color: "text-muted-foreground", bg: "bg-muted", border: "border-border" },
};

export default function MillionMode() {
  const [showConsentModal, setShowConsentModal] = useState(false);
  const { activate, activating, result } = useMillionMode();
  const { data: scores } = useLatestScores();
  
  const currentScore = scores?.[0]?.score || 580;
  
  // Use result sequence if available, otherwise use default
  const sequence = result?.sequence || [];
  const displaySequence = sequence.length > 0 
    ? sequence.map((s, index) => ({
        step: s.step,
        name: s.product,
        type: s.provider,
        funding: `$${s.expectedAmount.toLocaleString()}`,
        timeline: s.timing,
        status: index < 3 ? "available" : index < 5 ? "recommended" : "locked",
        description: s.action,
        requirements: s.requirements,
        riskLevel: s.riskLevel,
      }))
    : defaultFundingSequence;

  const totalPotential = result?.projectedTotal 
    ? `$${(result.projectedTotal / 1000).toFixed(0)}K`
    : "$500K - $1M+";
  
  const currentUnlocked = displaySequence.filter(s => s.status !== "locked").length;
  const totalSteps = displaySequence.length;

  const handleActivate = () => {
    setShowConsentModal(true);
  };

  const handleConsentComplete = async (consentId: string) => {
    setShowConsentModal(false);
    await activate(consentId);
  };

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
              <p className="text-muted-foreground">
                {result ? "Sequence activated" : "Elite funding sequence"}
              </p>
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
              <p className="text-xs text-muted-foreground mb-1">Your Score</p>
              <p className="text-xl font-bold text-primary">{currentScore}</p>
            </div>
            <div className="p-4 rounded-lg bg-card/50 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Risk Level</p>
              <p className={cn(
                "text-xl font-bold",
                result?.riskLevel === "low" ? "text-success" :
                result?.riskLevel === "high" ? "text-destructive" : "text-warning"
              )}>
                {result?.riskLevel ? result.riskLevel.charAt(0).toUpperCase() + result.riskLevel.slice(1) : "Medium"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              variant="premium" 
              size="lg" 
              disabled={activating}
              onClick={handleActivate}
            >
              {activating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Activating...
                </>
              ) : result ? (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  View Active Plan
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  Activate Million Mode
                </>
              )}
            </Button>
            <Button variant="outline" size="lg" onClick={() => {
              const el = document.getElementById("funding-sequence");
              el?.scrollIntoView({ behavior: "smooth" });
            }}>
              View Full Plan
            </Button>
          </div>

          {/* Warnings from activation */}
          {result?.warnings && result.warnings.length > 0 && (
            <div className="mt-4 p-3 rounded-lg bg-warning/10 border border-warning/30">
              <p className="text-sm font-medium text-warning">Notices:</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                {result.warnings.map((warning, i) => (
                  <li key={i}>• {warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Safety Notice */}
      <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
        <div>
          <p className="text-sm font-medium text-foreground">Human Review Required</p>
          <p className="text-xs text-muted-foreground">
            Each funding application requires your explicit consent and admin approval before submission. 
            Hard credit pulls are limited to protect your score.
          </p>
        </div>
      </div>

      {/* Funding Sequence */}
      <div>
        <h2 id="funding-sequence" className="text-lg font-semibold text-foreground mb-4">Funding Sequence</h2>
        <div className="relative">
          {/* Progress line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border">
            <div 
              className="w-full bg-gradient-to-b from-primary to-primary/50 transition-all duration-500"
              style={{ height: `${(currentUnlocked / totalSteps) * 100}%` }}
            />
          </div>

          <div className="space-y-4">
            {displaySequence.map((step, index) => {
              const config = statusConfig[step.status as keyof typeof statusConfig] || statusConfig.locked;
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
          <div className={cn(
            "flex items-center gap-3 p-3 rounded-lg border",
            currentScore >= 620 ? "bg-success/10 border-success/30" : "bg-muted border-border"
          )}>
            {currentScore >= 620 ? (
              <CheckCircle2 className="w-5 h-5 text-success" />
            ) : (
              <Target className="w-5 h-5 text-muted-foreground" />
            )}
            <div>
              <p className="text-sm font-medium text-foreground">Credit Score 620+</p>
              <p className={cn("text-xs", currentScore >= 620 ? "text-success" : "text-muted-foreground")}>
                Current: {currentScore}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted border border-border">
            <Target className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">3+ Months History</p>
              <p className="text-xs text-muted-foreground">Build tradeline age</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted border border-border">
            <DollarSign className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">Utilization Under 30%</p>
              <p className="text-xs text-muted-foreground">Pay down balances</p>
            </div>
          </div>
        </div>
      </div>

      {/* Consent Modal */}
      <ConsentModal
        open={showConsentModal}
        onOpenChange={setShowConsentModal}
        consentType="million_mode"
        title="Million Mode Authorization"
        description="Review and sign to activate the Million Mode funding sequence"
        onConsent={handleConsentComplete}
      />
    </div>
  );
}
