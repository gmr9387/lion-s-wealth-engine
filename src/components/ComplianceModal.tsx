import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Shield, FileCheck, Clock, AlertTriangle } from "lucide-react";

interface ComplianceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: {
    title: string;
    description: string;
    type: "dispute" | "funding" | "credit_pull" | "million_mode";
    humanRequired: boolean;
  };
  onProceed: () => void;
  onCancel?: () => void;
}

export function ComplianceModal({
  open,
  onOpenChange,
  action,
  onProceed,
  onCancel,
}: ComplianceModalProps) {
  const [acknowledged, setAcknowledged] = useState(false);
  const [understood, setUnderstood] = useState(false);

  const getComplianceInfo = () => {
    switch (action.type) {
      case "dispute":
        return {
          icon: FileCheck,
          title: "Credit Dispute Compliance",
          statutes: ["Fair Credit Reporting Act (FCRA)", "15 U.S.C. § 1681"],
          timeline: "30-45 days for bureau response",
          warnings: [
            "Only accurate information should be disputed",
            "False disputes may constitute fraud",
            "Results are not guaranteed",
          ],
        };
      case "funding":
        return {
          icon: Shield,
          title: "Funding Application Compliance",
          statutes: ["Equal Credit Opportunity Act (ECOA)", "Truth in Lending Act (TILA)"],
          timeline: "Varies by lender (typically 1-30 days)",
          warnings: [
            "Hard inquiries may affect your credit score",
            "You are responsible for any approved credit",
            "Read all terms before accepting offers",
          ],
        };
      case "credit_pull":
        return {
          icon: Shield,
          title: "Credit Pull Authorization",
          statutes: ["Fair Credit Reporting Act (FCRA)", "15 U.S.C. § 1681b"],
          timeline: "Immediate",
          warnings: [
            "This may be a hard or soft inquiry",
            "Hard inquiries can temporarily lower your score",
            "Multiple hard pulls in 14-45 days often count as one",
          ],
        };
      case "million_mode":
        return {
          icon: AlertTriangle,
          title: "Million Mode - Advanced Strategy",
          statutes: ["Multiple regulatory frameworks apply"],
          timeline: "48-72 hours for full sequence",
          warnings: [
            "Multiple hard inquiries will occur",
            "High risk/high reward strategy",
            "Requires excellent credit profile",
            "Not suitable for all users",
          ],
        };
    }
  };

  const info = getComplianceInfo();
  const Icon = info.icon;

  const handleProceed = () => {
    if (!acknowledged || !understood) return;
    onProceed();
    onOpenChange(false);
    setAcknowledged(false);
    setUnderstood(false);
  };

  const handleCancel = () => {
    setAcknowledged(false);
    setUnderstood(false);
    onOpenChange(false);
    onCancel?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${action.type === "million_mode" ? "bg-warning/10" : "bg-primary/10"}`}>
              <Icon className={`w-5 h-5 ${action.type === "million_mode" ? "text-warning" : "text-primary"}`} />
            </div>
            <DialogTitle className="text-xl">{info.title}</DialogTitle>
          </div>
          <DialogDescription>{action.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Action details */}
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <h4 className="font-medium text-foreground mb-2">{action.title}</h4>
            <p className="text-sm text-muted-foreground">{action.description}</p>
          </div>

          {/* Regulatory info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-card border border-border">
              <p className="text-xs text-muted-foreground mb-1">Applicable Laws</p>
              <ul className="text-sm space-y-1">
                {info.statutes.map((statute, i) => (
                  <li key={i} className="text-foreground">{statute}</li>
                ))}
              </ul>
            </div>
            <div className="p-3 rounded-lg bg-card border border-border">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Timeline</p>
              </div>
              <p className="text-sm text-foreground">{info.timeline}</p>
            </div>
          </div>

          {/* Warnings */}
          <div className="p-4 rounded-lg bg-warning/5 border border-warning/20">
            <p className="text-sm font-medium text-warning mb-2">Important Notices</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              {info.warnings.map((warning, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-warning">•</span>
                  {warning}
                </li>
              ))}
            </ul>
          </div>

          {/* Human review notice */}
          {action.humanRequired && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
              <Shield className="w-5 h-5 text-primary shrink-0" />
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-primary">Admin Review Required:</span> This action will be reviewed by our team before execution.
              </p>
            </div>
          )}

          {/* Acknowledgments */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Checkbox
                id="acknowledged"
                checked={acknowledged}
                onCheckedChange={(checked) => setAcknowledged(checked === true)}
                className="mt-0.5"
              />
              <Label htmlFor="acknowledged" className="text-sm cursor-pointer">
                I acknowledge the regulatory requirements and potential impacts of this action.
              </Label>
            </div>
            <div className="flex items-start gap-3">
              <Checkbox
                id="understood"
                checked={understood}
                onCheckedChange={(checked) => setUnderstood(checked === true)}
                className="mt-0.5"
              />
              <Label htmlFor="understood" className="text-sm cursor-pointer">
                I understand that results are not guaranteed and I accept responsibility for this action.
              </Label>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            variant={action.type === "million_mode" ? "glow" : "premium"}
            onClick={handleProceed}
            disabled={!acknowledged || !understood}
          >
            Proceed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
