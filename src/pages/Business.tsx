import { Button } from "@/components/ui/button";
import { 
  Building2, 
  FileText, 
  CreditCard, 
  TrendingUp,
  CheckCircle2,
  Circle,
  ArrowRight,
  Shield,
  DollarSign,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";

const businessSetupSteps = [
  {
    step: 1,
    title: "Choose Business Structure",
    description: "LLC recommended for liability protection and tax flexibility",
    status: "pending",
    action: "Select Structure",
  },
  {
    step: 2,
    title: "Register Business Name",
    description: "File with your state's Secretary of State",
    status: "pending",
    action: "Start Registration",
  },
  {
    step: 3,
    title: "Obtain EIN",
    description: "Free from IRS - takes 5 minutes online",
    status: "pending",
    action: "Apply for EIN",
  },
  {
    step: 4,
    title: "Open Business Bank Account",
    description: "Separate business and personal finances",
    status: "pending",
    action: "Compare Banks",
  },
  {
    step: 5,
    title: "Establish Business Address",
    description: "Virtual mailbox or physical location",
    status: "pending",
    action: "Get Address",
  },
  {
    step: 6,
    title: "Get Business Phone",
    description: "Dedicated business line for credibility",
    status: "pending",
    action: "Setup Phone",
  },
];

const vendorCredits = [
  {
    name: "Uline",
    type: "Net 30",
    creditLimit: "$500 - $1,000",
    requirements: ["EIN", "Business Bank Account"],
    status: "recommended",
  },
  {
    name: "Quill",
    type: "Net 30",
    creditLimit: "$500 - $750",
    requirements: ["EIN", "Business Address"],
    status: "recommended",
  },
  {
    name: "Grainger",
    type: "Net 30",
    creditLimit: "$1,000 - $5,000",
    requirements: ["EIN", "Trade References"],
    status: "upcoming",
  },
  {
    name: "Amazon Business",
    type: "Net 55",
    creditLimit: "$1,000 - $10,000",
    requirements: ["EIN", "Business Account"],
    status: "upcoming",
  },
];

const businessCards = [
  {
    name: "Chase Ink Business Unlimited",
    creditLimit: "$5,000 - $50,000",
    apr: "0% intro APR 12 months",
    requirements: "680+ score, 2+ years in business",
    status: "locked",
  },
  {
    name: "Amex Blue Business Plus",
    creditLimit: "$2,000 - $25,000",
    apr: "0% intro APR 12 months",
    requirements: "670+ score, established business",
    status: "locked",
  },
  {
    name: "Capital One Spark Cash",
    creditLimit: "$5,000 - $75,000",
    apr: "Variable",
    requirements: "700+ score, good revenue",
    status: "locked",
  },
];

export default function Business() {
  const completedSteps = 0;
  const totalSteps = businessSetupSteps.length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Business Credit</h1>
          <p className="text-muted-foreground mt-1">
            Build your business entity and unlock business funding
          </p>
        </div>
        <Button variant="premium">
          <Building2 className="w-4 h-4 mr-2" />
          Start Business Setup
        </Button>
      </div>

      {/* Progress Overview */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Business Formation Progress</h2>
          <span className="text-sm text-muted-foreground">
            {completedSteps}/{totalSteps} steps completed
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden mb-4">
          <div 
            className="h-full bg-gradient-gold transition-all duration-500"
            style={{ width: `${(completedSteps / totalSteps) * 100}%` }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {businessSetupSteps.map((step, index) => (
            <div
              key={index}
              className={cn(
                "p-4 rounded-lg border transition-all",
                step.status === "completed" 
                  ? "border-success/30 bg-success/5" 
                  : "border-border hover:border-primary/30"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                  step.status === "completed"
                    ? "bg-success text-success-foreground"
                    : "bg-muted text-muted-foreground"
                )}>
                  {step.status === "completed" ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    step.step
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground text-sm mb-1">{step.title}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{step.description}</p>
                  <Button variant="outline" size="sm" className="w-full">
                    {step.action}
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vendor Credit Section */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Vendor Credit (Net 30)</h2>
            <p className="text-sm text-muted-foreground">Build business credit without personal guarantee</p>
          </div>
          <Shield className="w-5 h-5 text-success" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vendorCredits.map((vendor, index) => (
            <div
              key={index}
              className={cn(
                "p-4 rounded-lg border transition-all",
                vendor.status === "recommended"
                  ? "border-primary/30 bg-primary/5"
                  : "border-border"
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-foreground">{vendor.name}</h3>
                  <p className="text-xs text-muted-foreground">{vendor.type}</p>
                </div>
                <span className={cn(
                  "px-2 py-0.5 rounded text-xs font-medium",
                  vendor.status === "recommended"
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                )}>
                  {vendor.status === "recommended" ? "Recommended" : "Coming Soon"}
                </span>
              </div>
              <p className="text-lg font-bold text-gradient-gold mb-2">{vendor.creditLimit}</p>
              <div className="flex flex-wrap gap-1.5">
                {vendor.requirements.map((req, i) => (
                  <span key={i} className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded text-xs">
                    {req}
                  </span>
                ))}
              </div>
              {vendor.status === "recommended" && (
                <Button variant="glow" size="sm" className="w-full mt-3">
                  Apply Now
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Business Credit Cards */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Business Credit Cards</h2>
            <p className="text-sm text-muted-foreground">Unlock after establishing business credit</p>
          </div>
          <CreditCard className="w-5 h-5 text-muted-foreground" />
        </div>

        <div className="space-y-3">
          {businessCards.map((card, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border border-border bg-muted/30 opacity-60"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{card.name}</h3>
                  <p className="text-sm text-success mt-1">{card.apr}</p>
                  <p className="text-xs text-muted-foreground mt-1">{card.requirements}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-muted-foreground">{card.creditLimit}</p>
                  <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-xs">
                    Locked
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-4 rounded-lg border border-primary/30 bg-primary/5">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Complete Business Formation First</p>
              <p className="text-xs text-muted-foreground">
                Business credit cards require an established business entity with EIN and business bank account. 
                Complete the setup steps above to unlock these options.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
