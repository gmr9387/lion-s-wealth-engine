import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Building2, 
  FileText, 
  CreditCard, 
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Shield,
  Loader2,
  Edit2,
  Save
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useBusiness } from "@/hooks/useBusiness";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
  "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
  "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
  "Wisconsin", "Wyoming"
];

export default function Business() {
  const { 
    loading, 
    entity, 
    steps, 
    completedSteps, 
    totalSteps, 
    progress,
    startBusinessSetup, 
    updateStep,
    updateEntity,
    hasStarted 
  } = useBusiness();
  
  const [editingEntity, setEditingEntity] = useState(false);
  const [entityForm, setEntityForm] = useState({
    business_name: "",
    ein: "",
    state_of_formation: "",
    business_address: "",
    business_phone: "",
  });

  const handleEditEntity = () => {
    if (entity) {
      setEntityForm({
        business_name: entity.business_name || "",
        ein: entity.ein || "",
        state_of_formation: entity.state_of_formation || "",
        business_address: entity.business_address || "",
        business_phone: entity.business_phone || "",
      });
    }
    setEditingEntity(true);
  };

  const handleSaveEntity = async () => {
    await updateEntity(entityForm);
    setEditingEntity(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

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
        {!hasStarted ? (
          <Button variant="premium" onClick={startBusinessSetup}>
            <Building2 className="w-4 h-4 mr-2" />
            Start Business Setup
          </Button>
        ) : (
          <Button variant="outline" onClick={handleEditEntity}>
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Business Info
          </Button>
        )}
      </div>

      {/* Business Info Card (if started) */}
      {entity && (
        <div className="rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 via-card to-accent/10 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {entity.business_name || "Your Business LLC"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {entity.entity_type?.toUpperCase()} • {entity.state_of_formation || "State pending"}
                </p>
              </div>
            </div>
            {entity.ein && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground">EIN</p>
                <p className="font-mono text-foreground">{entity.ein}</p>
              </div>
            )}
          </div>
          {(entity.business_address || entity.business_phone) && (
            <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-2 gap-4">
              {entity.business_address && (
                <div>
                  <p className="text-xs text-muted-foreground">Address</p>
                  <p className="text-sm text-foreground">{entity.business_address}</p>
                </div>
              )}
              {entity.business_phone && (
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm text-foreground">{entity.business_phone}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

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
            style={{ width: `${progress}%` }}
          />
        </div>

        {!hasStarted ? (
          <div className="text-center py-8">
            <Building2 className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Ready to Build Business Credit?</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              Start your business formation journey to unlock vendor credit lines and business credit cards.
            </p>
            <Button variant="premium" onClick={startBusinessSetup}>
              Start Business Setup
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {steps.map((step) => (
              <div
                key={step.id}
                className={cn(
                  "p-4 rounded-lg border transition-all",
                  step.status === "completed" 
                    ? "border-success/30 bg-success/5" 
                    : step.status === "in_progress"
                    ? "border-primary/30 bg-primary/5"
                    : "border-border hover:border-primary/30"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                    step.status === "completed"
                      ? "bg-success text-success-foreground"
                      : step.status === "in_progress"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}>
                    {step.status === "completed" ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      step.step_number
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground text-sm mb-1">{step.step_title}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{step.step_description}</p>
                    {step.status === "completed" ? (
                      <span className="text-xs text-success">Completed</span>
                    ) : step.status === "in_progress" ? (
                      <Button 
                        variant="glow" 
                        size="sm" 
                        className="w-full"
                        onClick={() => updateStep(step.id, "completed")}
                      >
                        Mark Complete
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => updateStep(step.id, "in_progress")}
                      >
                        Start Step
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
              {vendor.status === "recommended" && hasStarted && (
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
              className={cn(
                "p-4 rounded-lg border border-border bg-muted/30",
                !hasStarted || completedSteps < 3 ? "opacity-60" : ""
              )}
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
                    {completedSteps >= 3 ? "Available" : "Locked"}
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

      {/* Edit Entity Dialog */}
      <Dialog open={editingEntity} onOpenChange={setEditingEntity}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Business Information</DialogTitle>
            <DialogDescription>
              Update your business entity details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="business_name">Business Name</Label>
              <Input
                id="business_name"
                value={entityForm.business_name}
                onChange={(e) => setEntityForm({ ...entityForm, business_name: e.target.value })}
                placeholder="Your Business LLC"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ein">EIN (Tax ID)</Label>
              <Input
                id="ein"
                value={entityForm.ein}
                onChange={(e) => setEntityForm({ ...entityForm, ein: e.target.value })}
                placeholder="XX-XXXXXXX"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State of Formation</Label>
              <Select
                value={entityForm.state_of_formation}
                onValueChange={(value) => setEntityForm({ ...entityForm, state_of_formation: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {US_STATES.map((state) => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Business Address</Label>
              <Input
                id="address"
                value={entityForm.business_address}
                onChange={(e) => setEntityForm({ ...entityForm, business_address: e.target.value })}
                placeholder="123 Business St, City, State ZIP"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Business Phone</Label>
              <Input
                id="phone"
                value={entityForm.business_phone}
                onChange={(e) => setEntityForm({ ...entityForm, business_phone: e.target.value })}
                placeholder="(555) 123-4567"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setEditingEntity(false)}>Cancel</Button>
              <Button variant="premium" onClick={handleSaveEntity}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
